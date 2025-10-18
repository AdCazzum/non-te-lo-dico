"use client";

import { useState, useCallback } from "react";

/**
 * Alternative IPFS upload using a public gateway or local node
 */
export function usePublicIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadToIPFS = useCallback(async (encryptedContent: string, fileName: string): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Convert string to File object
      const blob = new Blob([encryptedContent], { type: 'application/octet-stream' });
      const file = new File([blob], fileName, { type: 'application/octet-stream' });

      // Try to use kubo-rpc-client if available
      const { create } = await import('kubo-rpc-client');
      
      // Try to connect to local IPFS node first, then public gateways
      const endpoints = [
        '/ip4/127.0.0.1/tcp/5001', // Local node
        'https://ipfs.infura.io:5001', // Infura
      ];

      let lastError: Error | null = null;
      
      for (const endpoint of endpoints) {
        try {
          const ipfs = create({ url: endpoint });
          const result = await ipfs.add(file, {
            progress: (prog) => console.log(`Upload progress: ${prog} bytes`),
          });
          
          console.log('File uploaded to IPFS:', result.path);
          return result.path;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Failed to upload to ${endpoint}:`, error);
        }
      }

      throw lastError || new Error('All IPFS endpoints failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      console.error('IPFS upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    uploadToIPFS,
    isUploading,
    uploadError,
  };
}
