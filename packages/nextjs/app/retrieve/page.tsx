"use client";

import { useState, useEffect, useMemo } from "react";
import { useFhevm, useInMemoryStorage } from "@fhevm-sdk";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useFHEIPFSStorage } from "~~/hooks/useFHEIPFSStorage";
import { useIPFSDownload } from "~~/hooks/useIPFS";
import { decryptFile, arrayBufferToText } from "~~/utils/crypto";
import { notification } from "~~/utils/helper/notification";
import Link from "next/link";

export default function RetrievePage() {
  const searchParams = useSearchParams();
  const cidFromUrl = searchParams.get("cid");

  const { isConnected, address, chain } = useAccount();
  const chainId = chain?.id;

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
  const { downloadFromIPFS, isDownloading } = useIPFSDownload();
  const { storage: decryptionStorage } = useInMemoryStorage();

  const [inputCID, setInputCID] = useState(cidFromUrl || "");
  const [currentCID, setCurrentCID] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{ owner: string; timestamp: bigint } | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load file from URL
  useEffect(() => {
    if (cidFromUrl && isConnected && fhevmInstance) {
      handleRetrieve(cidFromUrl);
    }
  }, [cidFromUrl, isConnected, fhevmInstance]);

  // Handle file retrieval
  const handleRetrieve = async (cid?: string) => {
    const cidToUse = cid || inputCID;
    
    if (!cidToUse) {
      notification.error("Please enter a CID");
      return;
    }

    if (!address) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!fhevmInstance) {
      notification.error("FHEVM not initialized");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setDecryptedContent(null);
    setHasAccess(null);

    try {
      // Step 1: Check if file exists
      const exists = await storage.fileExists(cidToUse);
      if (!exists) {
        throw new Error("File not found on blockchain");
      }

      // Step 2: Get file metadata
      const metadata = await storage.getFileMetadata(cidToUse);
      if (!metadata) {
        throw new Error("Failed to retrieve file metadata");
      }
      setFileMetadata(metadata);
      setCurrentCID(cidToUse);

      // Step 3: Try to get encrypted key (will fail if no access)
      notification.info("Checking access permissions...");
      const encryptedKeyHandle = await storage.getEncryptedKey(cidToUse);
      
      if (!encryptedKeyHandle) {
        setHasAccess(false);
        throw new Error("Access denied: You don't have permission to decrypt this file");
      }

      setHasAccess(true);
      notification.info("Access granted! Decrypting key...");

      // Step 4: Decrypt the encryption key using FHEVM
      // TODO: Implement proper FHEVM decryption
      // For now this is a placeholder - need to implement proper decryption flow
      notification.error("Decryption feature needs to be implemented with proper FHEVM flow");
      throw new Error("Decryption not yet fully implemented");

      // Step 5: Download encrypted file from IPFS (commented out until decrypt is implemented)
      /*
      notification.info("Downloading file from IPFS...");
      const encryptedContent = await downloadFromIPFS(cidToUse);
      
      if (!encryptedContent) {
        throw new Error("Failed to download file from IPFS");
      }

      // Step 6: Decrypt the file content
      notification.info("Decrypting file...");
      const decryptedData = await decryptFile(encryptedContent, decryptedKey);
      const textContent = arrayBufferToText(decryptedData);
      
      setDecryptedContent(textContent);
      notification.success("File decrypted successfully!");
      */

    } catch (error: any) {
      console.error("Retrieve error:", error);
      const errorMessage = error?.message || "Failed to retrieve file";
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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
          <p className="text-gray-700 mb-6">Connect your wallet to retrieve encrypted files</p>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Retrieve File</h1>
        <p className="text-gray-600">
          Access and decrypt files shared with you
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mb-6">
        <Link 
          href="/" 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
        >
          📤 Upload File
        </Link>
        <Link 
          href="/retrieve" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
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

      {/* Input CID Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter File CID</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IPFS CID
            </label>
            <input
              type="text"
              value={inputCID}
              onChange={(e) => setInputCID(e.target.value)}
              placeholder="Enter IPFS CID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isProcessing}
            />
          </div>

          <button
            onClick={() => handleRetrieve()}
            disabled={!inputCID || isProcessing || !fhevmInstance}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isProcessing ? "Processing..." : "Retrieve & Decrypt File"}
          </button>
        </div>
      </div>

      {/* File Metadata */}
      {fileMetadata && currentCID && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">File Information</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">CID:</p>
              <p className="text-sm text-gray-900 break-all font-mono">{currentCID}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Owner:</p>
              <p className="text-sm text-gray-900 font-mono">{fileMetadata.owner}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Uploaded:</p>
              <p className="text-sm text-gray-900">
                {new Date(Number(fileMetadata.timestamp) * 1000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Access Denied */}
      {hasAccess === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 text-4xl">
                🚫
              </span>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-red-700">
              You don't have permission to decrypt this file.
            </p>
            <p className="text-sm text-red-600 mt-2">
              Please contact the file owner to request access.
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !hasAccess && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Decrypted Content */}
      {decryptedContent && hasAccess && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📄 File Content</h2>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {decryptedContent}
            </pre>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(decryptedContent);
                notification.success("Content copied to clipboard!");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              📋 Copy Content
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
