"use client";

import { useState, useCallback } from "react";

/**
 * Combined IPFS upload hook that tries multiple methods
 */
export function useCombinedIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<string | null>(null);

  const uploadToIPFS = useCallback(async (encryptedContent: string, fileName: string): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadMethod(null);

    try {
      // Method 1: Try Pinata first
      const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
      
      if (pinataJWT && pinataJWT !== 'your_pinata_jwt_token_here') {
        try {
          console.log('Attempting upload via Pinata...');
          const blob = new Blob([encryptedContent], { type: 'application/octet-stream' });
          const formData = new FormData();
          formData.append('file', blob, fileName);

          const metadata = JSON.stringify({
            name: fileName,
          });
          formData.append('pinataMetadata', metadata);

          const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${pinataJWT}`,
            },
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const cid = data.IpfsHash;
            
            if (cid) {
              console.log('✅ Uploaded via Pinata:', cid);
              setUploadMethod('Pinata');
              return cid;
            }
          } else {
            const errorText = await response.text();
            console.warn('Pinata upload failed:', errorText);
          }
        } catch (error) {
          console.warn('Pinata upload error:', error);
        }
      }

      // Method 2: Try using kubo-rpc-client with public gateways
      try {
        console.log('Attempting upload via IPFS HTTP client...');
        const { create } = await import('kubo-rpc-client');
        
        const blob = new Blob([encryptedContent], { type: 'application/octet-stream' });
        const buffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);

        // Try Infura IPFS
        try {
          const ipfs = create({ 
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https'
          });
          
          const result = await ipfs.add(uint8Array, {
            progress: (prog) => console.log(`Upload progress: ${prog}`),
          });
          
          console.log('✅ Uploaded via Infura IPFS:', result.path);
          setUploadMethod('Infura IPFS');
          return result.path;
        } catch (error) {
          console.warn('Infura IPFS failed:', error);
        }

        // Try local node as last resort
        try {
          const ipfs = create({ url: 'http://127.0.0.1:5001' });
          const result = await ipfs.add(uint8Array);
          
          console.log('✅ Uploaded via local IPFS:', result.path);
          setUploadMethod('Local IPFS');
          return result.path;
        } catch (error) {
          console.warn('Local IPFS failed:', error);
        }
      } catch (error) {
        console.warn('IPFS HTTP client error:', error);
      }

      throw new Error('All IPFS upload methods failed. Please configure NEXT_PUBLIC_PINATA_JWT in your .env file');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      console.error('❌ IPFS upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadToIPFS,
    isUploading,
    uploadError,
    uploadMethod,
  };
}
