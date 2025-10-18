"use client";

import { useState, useMemo } from "react";
import { useFhevm } from "@fhevm-sdk";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { PinataSetupInstructions } from "~~/components/PinataSetupInstructions";
import { useFHEIPFSStorage } from "~~/hooks/useFHEIPFSStorage";
import { useCombinedIPFSUpload } from "~~/hooks/useCombinedIPFS";
import { generateEncryptionKey, encryptFile } from "~~/utils/crypto";
import { notification } from "~~/utils/helper/notification";
import Link from "next/link";

export default function UploadPage() {
  const { isConnected, address, chain } = useAccount();
  const chainId = chain?.id;

  // Check if Pinata is configured
  const isPinataConfigured = useMemo(() => {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    return jwt && jwt !== 'your_pinata_jwt_token_here' && jwt.length > 0;
  }, []);

  // Create EIP-1193 provider from wagmi for FHEVM
  const provider = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return (window as any).ethereum;
  }, []);

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    enabled: true,
  });

  const storage = useFHEIPFSStorage(fhevmInstance);
  const { uploadToIPFS, isUploading, uploadError, uploadMethod } = useCombinedIPFSUpload();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<number | null>(null);
  const [uploadedCID, setUploadedCID] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [granteeAddress, setGranteeAddress] = useState("");

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setEncryptionKey(null);
      setUploadedCID(null);
    }
  };

  // Handle file upload and encryption
  const handleUpload = async () => {
    if (!selectedFile) {
      notification.error("Please select a file");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Generate random encryption key
      const key = generateEncryptionKey();
      setEncryptionKey(key);
      notification.info("Generated encryption key");

      // Step 2: Encrypt file
      const fileContent = await selectedFile.arrayBuffer();
      const encryptedContent = await encryptFile(fileContent, key);
      notification.info("File encrypted successfully");

      // Step 3: Upload encrypted file to IPFS
      const cid = await uploadToIPFS(encryptedContent, `encrypted_${selectedFile.name}`);
      
      if (!cid) {
        throw new Error("Failed to upload to IPFS");
      }

      setUploadedCID(cid);
      notification.success(`File uploaded to IPFS: ${cid}`);

      // Step 4: Encrypt the key with ZAMA and store on blockchain
      const success = await storage.storeFile(cid, key);
      
      if (success) {
        notification.success("File stored on blockchain!");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      notification.error(error?.message || "Failed to upload file");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle grant access
  const handleGrantAccess = async () => {
    if (!uploadedCID) {
      notification.error("No file uploaded yet");
      return;
    }

    if (!granteeAddress || !granteeAddress.startsWith("0x") || granteeAddress.length !== 42) {
      notification.error("Please enter a valid Ethereum address");
      return;
    }

    const success = await storage.grantAccess(uploadedCID, granteeAddress);
    if (success) {
      setGranteeAddress("");
    }
  };

  // Generate shareable link
  const generateShareLink = () => {
    if (!uploadedCID) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/retrieve?cid=${uploadedCID}`;
  };

  // Copy share link
  const handleCopyLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link);
    notification.success("Share link copied to clipboard!");
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-xl rounded-lg p-8 text-center">
          <div className="mb-4">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-900/30 text-amber-400 text-3xl">
              ⚠️
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-700 mb-6">Connect your wallet to upload encrypted files</p>
          <div className="flex items-center justify-center">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔐 Secure File Upload</h1>
        <p className="text-gray-600">
          Upload encrypted files to IPFS with FHE-protected decryption keys
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mb-6">
        <Link 
          href="/" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          📤 Upload File
        </Link>
        <Link 
          href="/retrieve" 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          🔍 Retrieve File
        </Link>
      </div>

      {/* FHEVM Status */}
      {fhevmError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">⚠️ FHEVM Error: {fhevmError.message}</p>
        </div>
      )}

      {fhevmStatus === "loading" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">🔄 Initializing FHEVM...</p>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">❌ Upload Error: {uploadError}</p>
          <p className="text-xs text-red-600 mt-1">
            Make sure you have configured NEXT_PUBLIC_PINATA_JWT in your .env file
          </p>
        </div>
      )}

      {/* Show Pinata setup instructions if not configured */}
      {!isPinataConfigured && (
        <PinataSetupInstructions />
      )}

      {/* Upload Success with Method */}
      {uploadMethod && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">✅ Uploaded successfully via {uploadMethod}</p>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload File</h2>
        
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <input
              type="file"
              onChange={handleFileSelect}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isProcessing || isUploading}
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isProcessing || isUploading || !fhevmInstance}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing || isUploading ? "Processing..." : "Encrypt & Upload to IPFS"}
          </button>

          {/* Status Display */}
          {encryptionKey && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                ✓ Encryption key generated: {encryptionKey}
              </p>
            </div>
          )}

          {uploadedCID && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium mb-2">
                ✓ File uploaded successfully!
              </p>
              <p className="text-xs text-green-700 break-all">
                IPFS CID: {uploadedCID}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grant Access Section */}
      {uploadedCID && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Grant Access</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ethereum Address
              </label>
              <input
                type="text"
                value={granteeAddress}
                onChange={(e) => setGranteeAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <button
              onClick={handleGrantAccess}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Grant Access
            </button>
          </div>
        </div>
      )}

      {/* Share Link Section */}
      {uploadedCID && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Share File</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Shareable Link:</p>
              <p className="text-sm text-blue-600 break-all font-mono">
                {generateShareLink()}
              </p>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              📋 Copy Share Link
            </button>

            <p className="text-xs text-gray-500 text-center">
              Share this link with users who have been granted access
            </p>
          </div>
        </div>
      )}

      {/* My Files Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Files</h2>
        
        {storage.isLoading ? (
          <p className="text-gray-600">Loading...</p>
        ) : storage.myFiles.length === 0 ? (
          <p className="text-gray-600">No files uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {storage.myFiles.map((file, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 break-all">
                      CID: {file.cid}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Uploaded: {new Date(Number(file.timestamp) * 1000).toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href={`/retrieve?cid=${file.cid}`}
                    className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
