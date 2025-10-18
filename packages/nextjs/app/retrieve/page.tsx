"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useFhevm, useInMemoryStorage, useFHEDecrypt } from "@fhevm-sdk";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useFHEIPFSStorage } from "~~/hooks/useFHEIPFSStorage";
import { useIPFSDownload } from "~~/hooks/useIPFS";
import { decryptFile, arrayBufferToText } from "~~/utils/crypto";
import { notification } from "~~/utils/helper/notification";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";
import Link from "next/link";
import { Icon } from "~~/components/Icon";

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
  const { ethersSigner } = useWagmiEthers();

  const [inputCID, setInputCID] = useState(cidFromUrl || "");
  const [currentCID, setCurrentCID] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{ owner: string; timestamp: bigint } | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent multiple processing
  const hasTriggeredDecrypt = useRef(false);
  const processedHandles = useRef<Set<string>>(new Set());

  // Decryption state - following ZAMA SDK pattern
  const [decryptRequests, setDecryptRequests] = useState<
    Array<{ handle: string; contractAddress: `0x${string}` }>
  >([]);

  // useFHEDecrypt hook - following ZAMA SDK pattern
  const {
    decrypt,
    results: decryptResults,
    isDecrypting,
    error: decryptError,
    message: decryptMessage,
  } = useFHEDecrypt({
    instance: fhevmInstance,
    ethersSigner,
    fhevmDecryptionSignatureStorage: decryptionStorage,
    chainId,
    requests: decryptRequests,
  });

  // Auto-load file from URL
  useEffect(() => {
    // Wait for everything to be ready before auto-loading
    if (cidFromUrl && isConnected && fhevmInstance && fhevmStatus === "ready" && ethersSigner) {
      // Small delay to ensure SDK is fully initialized
      const timer = setTimeout(() => {
        handleRetrieve(cidFromUrl);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [cidFromUrl, isConnected, fhevmInstance, fhevmStatus, ethersSigner]);

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

    if (fhevmStatus !== "ready") {
      notification.error("FHEVM is still loading. Please wait...");
      return;
    }

    if (!storage.contractAddress) {
      notification.error("Contract not initialized");
      return;
    }

    if (!ethersSigner) {
      notification.error("Wallet signer not available");
      return;
    }

    // Reset state for new retrieval
    setIsProcessing(true);
    setError(null);
    setDecryptedContent(null);
    setHasAccess(null);
    setDecryptRequests([]);
    hasTriggeredDecrypt.current = false;
    processedHandles.current.clear();

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

      // Debug logging (uncomment if needed)
      // console.log("Encrypted key handle received:", encryptedKeyHandle);
      // console.log("Type of handle:", typeof encryptedKeyHandle);
      // console.log("Is string:", typeof encryptedKeyHandle === 'string');

      // Validate that we have a proper hex string
      if (typeof encryptedKeyHandle !== 'string') {
        throw new Error(`Invalid handle type: expected string, got ${typeof encryptedKeyHandle}`);
      }

      if (!encryptedKeyHandle.startsWith('0x')) {
        throw new Error(`Invalid handle format: expected hex string starting with 0x, got ${encryptedKeyHandle}`);
      }

      // Step 4: Decrypt the encryption key using FHEVM - following ZAMA SDK pattern
      // Set the decrypt request
      setDecryptRequests([
        {
          handle: encryptedKeyHandle,
          contractAddress: storage.contractAddress as `0x${string}`,
        },
      ]);

      // Reset the trigger flag for new decryption
      hasTriggeredDecrypt.current = false;

      // Trigger decryption (this will happen in the useEffect below)

    } catch (error: any) {
      console.error("Retrieve error:", error);
      const errorMessage = error?.message || "Failed to retrieve file";
      setError(errorMessage);
      notification.error(errorMessage);
      setIsProcessing(false);
    }
  };

  // Effect to trigger decryption when requests are set
  useEffect(() => {
    if (decryptRequests.length > 0 && !isDecrypting && ethersSigner && !hasTriggeredDecrypt.current) {
      // Debug logging (uncomment if needed)
      // console.log("🔐 Starting decryption process...");
      // console.log("Chain ID:", chainId);
      // console.log("FHEVM Status:", fhevmStatus);
      // console.log("Decrypt Requests:", decryptRequests);
      // console.log("Signer available:", !!ethersSigner);
      // console.log("Instance available:", !!fhevmInstance);
      
      hasTriggeredDecrypt.current = true;
      decrypt();
    }
  }, [decryptRequests, isDecrypting, decrypt, ethersSigner]);

  // Effect to handle decryption results
  useEffect(() => {
    const processDecryptedKey = async () => {
      if (!currentCID || !decryptRequests.length) return;

      const handle = decryptRequests[0].handle;
      const decryptedKey = decryptResults[handle];

      // Check if we've already processed this handle
      if (decryptedKey === undefined || processedHandles.current.has(handle)) {
        return;
      }

      // Mark this handle as processed
      processedHandles.current.add(handle);

      try {
        // Convert bigint to number (our encryption key is a 32-bit uint)
        let encryptionKey: number;
        
        if (typeof decryptedKey === 'bigint') {
          encryptionKey = Number(decryptedKey);
        } else if (typeof decryptedKey === 'string') {
          encryptionKey = parseInt(decryptedKey, 10);
        } else if (typeof decryptedKey === 'boolean') {
          throw new Error("Unexpected boolean value for encryption key");
        } else {
          encryptionKey = decryptedKey as number;
        }

        notification.success("Key decrypted successfully!");
        notification.info("Downloading file from IPFS...");

        // Step 5: Download encrypted file from IPFS
        const encryptedContent = await downloadFromIPFS(currentCID);
        
        if (!encryptedContent) {
          throw new Error("Failed to download file from IPFS");
        }

        // Step 6: Decrypt the file content
        notification.info("Decrypting file...");
        const decryptedData = await decryptFile(encryptedContent, encryptionKey);
        const textContent = arrayBufferToText(decryptedData);
        
        setDecryptedContent(textContent);
        notification.success("File decrypted successfully!");

        // Clear decrypt requests
        setDecryptRequests([]);

      } catch (error: any) {
        console.error("Decryption error:", error);
        const errorMessage = error?.message || "Failed to decrypt file";
        setError(errorMessage);
        
        // Generic error notification
        notification.error(`❌ Decryption Error: ${errorMessage}`);
      } finally {
        setIsProcessing(false);
      }
    };

    processDecryptedKey();
  }, [decryptResults, currentCID, decryptRequests]);

  if (!isConnected) {
    return (
      <main className="section-padding">
        <div className="container-minimal max-w-2xl">
          <div className="card p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)] flex items-center justify-center">
                <Icon name="alert" size={32} className="text-[var(--color-foreground)]" />
              </div>
            </div>
            <h2 className="mb-4">Wallet Not Connected</h2>
            <p className="mb-8">Connect your wallet to retrieve encrypted files</p>
            <div className="flex justify-center">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section-padding">
      <div className="container-minimal max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="mb-4">Retrieve File</h1>
          <p className="text-muted">
            Access and decrypt files shared with you
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          <Link 
            href="/upload" 
            className="btn-outline flex items-center gap-2"
          >
            <Icon name="upload" size={18} />
            Upload
          </Link>
          <Link 
            href="/retrieve" 
            className="btn-primary flex items-center gap-2"
          >
            <Icon name="download" size={18} />
            Retrieve
          </Link>
        </div>

        <div className="space-y-6">
          {/* Status Messages */}
          {fhevmError && (
            <div className="card p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <Icon name="alert" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">FHEVM Error</p>
                  <p className="text-sm text-red-700 mt-1">{fhevmError.message}</p>
                </div>
              </div>
            </div>
          )}

          {fhevmStatus === "loading" && (
            <div className="card p-4 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex items-start gap-3">
                <Icon name="loading" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900">Initializing FHEVM SDK... Please wait.</p>
              </div>
            </div>
          )}

          {fhevmStatus === "ready" && (
            <div className="card p-4 border-l-4 border-green-500 bg-green-50">
              <div className="flex items-start gap-3">
                <Icon name="check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900">FHEVM SDK Ready</p>
              </div>
            </div>
          )}

          {/* Input CID Section */}
          <div className="card p-8">
            <h3 className="mb-6">Enter File CID</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  IPFS Content Identifier
                </label>
                <input
                  type="text"
                  value={inputCID}
                  onChange={(e) => setInputCID(e.target.value)}
                  placeholder="Enter IPFS CID..."
                  className="input-field"
                  disabled={isProcessing}
                />
              </div>

              <button
                onClick={() => handleRetrieve()}
                disabled={!inputCID || isProcessing || fhevmStatus !== "ready" || !ethersSigner}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Icon name="loading" size={18} />
                    Processing...
                  </>
                ) : fhevmStatus !== "ready" ? (
                  <>
                    <Icon name="loading" size={18} />
                    Waiting for FHEVM...
                  </>
                ) : !ethersSigner ? (
                  <>
                    <Icon name="loading" size={18} />
                    Waiting for Wallet...
                  </>
                ) : (
                  <>
                    <Icon name="unlock" size={18} />
                    Retrieve & Decrypt File
                  </>
                )}
              </button>
            </div>
          </div>

          {/* File Metadata */}
          {fileMetadata && currentCID && (
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="file" size={24} />
                <h3>File Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted mb-1">CID</p>
                  <p className="text-sm break-all font-mono">{currentCID}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted mb-1">Owner</p>
                  <p className="text-sm font-mono">{fileMetadata.owner}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted mb-1">Uploaded</p>
                  <p className="text-sm">
                    {new Date(Number(fileMetadata.timestamp) * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Decryption Progress */}
          {isDecrypting && (
            <div className="card p-6 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex items-center gap-3">
                <Icon name="loading" size={24} className="text-blue-600" />
                <p className="text-sm text-blue-900 font-medium">
                  {decryptMessage || "Decrypting encryption key with FHEVM..."}
                </p>
              </div>
            </div>
          )}

          {/* Decryption Error */}
          {decryptError && (
            <div className="card p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <Icon name="x" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Decryption Error</p>
                  <p className="text-sm text-red-700 mt-1">{decryptError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Access Denied */}
          {hasAccess === false && (
            <div className="card p-10">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <Icon name="x" size={32} className="text-red-600" />
                  </div>
                </div>
                <h3 className="mb-3 text-red-900">Access Denied</h3>
                <p className="text-sm text-red-700 mb-2">
                  You don't have permission to decrypt this file.
                </p>
                <p className="text-xs text-red-600">
                  Please contact the file owner to request access.
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && !hasAccess && (
            <div className="card p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <Icon name="alert" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Decrypted Content */}
          {decryptedContent && hasAccess && (
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="file" size={24} />
                <h3>File Content</h3>
              </div>
              
              <div className="card bg-[var(--color-secondary)] p-6 mb-6">
                <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96">
                  {decryptedContent}
                </pre>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(decryptedContent);
                  notification.success("Content copied to clipboard!");
                }}
                className="btn-outline flex items-center gap-2"
              >
                <Icon name="copy" size={18} />
                Copy Content
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
