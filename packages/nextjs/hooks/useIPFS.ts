"use client";

import { useState, useCallback } from "react";

/**
 * Hook for uploading files to IPFS via Pinata
 */
export function useIPFSUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadToIPFS = useCallback(async (encryptedContent: string, fileName: string): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const pinataJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
      
      if (!pinataJWT || pinataJWT === 'your_pinata_jwt_token_here') {
        throw new Error('Pinata JWT not configured. Please set NEXT_PUBLIC_PINATA_JWT in your .env file');
      }

      // Create a blob from the encrypted content
      const blob = new Blob([encryptedContent], { type: 'application/octet-stream' });
      const formData = new FormData();
      formData.append('file', blob, fileName);

      // Optional: Add metadata
      const metadata = JSON.stringify({
        name: fileName,
      });
      formData.append('pinataMetadata', metadata);

      // Upload to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Pinata error response:', errorData);
        throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      const cid = data.IpfsHash;
      
      if (!cid) {
        throw new Error('No CID returned from Pinata');
      }
      
      console.log('File uploaded to IPFS:', cid);
      return cid;
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

/**
 * Hook for downloading files from IPFS
 */
export function useIPFSDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const downloadFromIPFS = useCallback(async (cid: string): Promise<string | null> => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Download from IPFS gateway
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const encryptedContent = await response.text();
      return encryptedContent;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      setDownloadError(errorMessage);
      console.error('IPFS download error:', error);
      return null;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    downloadFromIPFS,
    isDownloading,
    downloadError,
  };
}
