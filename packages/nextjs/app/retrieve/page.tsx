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
      // Delay to ensure SDK is fully initialized and avoid RelayerSDKLoader errors
      const timer = setTimeout(() => {
        handleRetrieve(cidFromUrl);
      }, 1000);
      
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
        <div className="container-minimal max-w-2xl mx-auto">
          <div className="card p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-secondary)] flex items-center justify-center">
                <Icon name="alert" size={32} className="text-[var(--color-foreground)]" />
              </div>
            </div>
            <h2 className="mb-4">Connect Your Wallet</h2>
            <p className="mb-8 text-muted">
              To retrieve and decrypt shared datasets, please connect your Ethereum wallet. 
              Access is granted through ZAMA's ACL system based on your wallet address.
            </p>
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
      <div className="container-minimal max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="download" size={32} className="text-[var(--color-primary)]" />
            <h1>Retrieve Shared Dataset</h1>
          </div>
          <p className="text-muted text-lg">
            Access datasets that have been shared with you. Decryption is only possible if the data owner 
            has granted access to your wallet address through ZAMA's secure ACL system.
          </p>
        </div>

        {/* Trust & Security Info Banner */}
        <div className="card p-6 mb-8 bg-[var(--color-surface)] border-l-4 border-[var(--color-primary)]">
          <div className="flex items-start gap-4">
            <Icon name="shield" size={24} className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
            <div>
              <h4 className="mb-2 font-semibold">Secure & Transparent Access</h4>
              <p className="text-sm text-muted">
                The decryption key is retrieved from the blockchain using ZAMA's Fully Homomorphic Encryption. 
                Your access is verified cryptographically, ensuring the data owner's privacy preferences are always respected.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Messages */}
          {fhevmError && !fhevmError.message.includes("RelayerSDKLoader") && (
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
            <div className="card p-4 border-l-4 border-[var(--color-primary)] bg-[var(--color-surface)]">
              <div className="flex items-start gap-3">
                <Icon name="loading" size={20} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--color-foreground)]">Initializing FHEVM SDK... Please wait.</p>
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold">
                1
              </div>
              <h3>Enter Dataset Identifier</h3>
            </div>
            
            <p className="text-sm text-muted mb-6">
              Paste the IPFS Content Identifier (CID) from the share link you received. 
              This identifier points to the encrypted dataset on IPFS.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">
                  IPFS Content Identifier (CID)
                </label>
                <input
                  type="text"
                  value={inputCID}
                  onChange={(e) => setInputCID(e.target.value)}
                  placeholder="Enter IPFS CID from the share link..."
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
                    <Icon name="loading" size={18} className="text-[#0f0f0f]" />
                    Verifying Access & Decrypting...
                  </>
                ) : fhevmStatus !== "ready" ? (
                  <>
                    <Icon name="loading" size={18} className="text-[#0f0f0f]" />
                    Initializing FHEVM SDK...
                  </>
                ) : !ethersSigner ? (
                  <>
                    <Icon name="loading" size={18} className="text-[#0f0f0f]" />
                    Connecting to Wallet...
                  </>
                ) : (
                  <>
                    <Icon name="unlock" size={18} />
                    Retrieve & Decrypt Dataset
                  </>
                )}
              </button>

              <div className="bg-[var(--color-secondary)] p-4 rounded-lg">
                <p className="text-xs text-muted">
                  <Icon name="info" size={14} className="inline mr-1" />
                  The system will check your access permissions on-chain. If authorized, the decryption key 
                  will be retrieved using FHE and the dataset will be decrypted on your device.
                </p>
              </div>
            </div>
          </div>

          {/* File Metadata */}
          {fileMetadata && currentCID && (
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="file" size={24} className="text-[var(--color-primary)]" />
                <h3>Dataset Information</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[var(--color-secondary)] p-4 rounded-lg">
                  <p className="text-xs text-muted mb-2">IPFS Content Identifier</p>
                  <p className="text-sm break-all font-mono">{currentCID}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[var(--color-secondary)] p-4 rounded-lg">
                    <p className="text-xs text-muted mb-2">Owner</p>
                    <p className="text-sm font-mono">{fileMetadata.owner}</p>
                  </div>
                  <div className="bg-[var(--color-secondary)] p-4 rounded-lg">
                    <p className="text-xs text-muted mb-2">Upload Date</p>
                    <p className="text-sm">
                      {new Date(Number(fileMetadata.timestamp) * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Decryption Progress */}
          {isDecrypting && (
            <div className="card p-6 border-l-4 border-[var(--color-primary)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-3">
                <Icon name="loading" size={24} className="text-[var(--color-primary)]" />
                <p className="text-sm text-[var(--color-foreground)] font-medium">
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
                  <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                    <Icon name="lock" size={36} className="text-red-600" />
                  </div>
                </div>
                <h3 className="mb-4 text-red-900 text-2xl">Access Not Granted</h3>
                <p className="text-sm text-red-700 mb-3 max-w-md mx-auto">
                  Your wallet address does not have permission to decrypt this dataset. 
                  The data owner must explicitly grant you access through the platform.
                </p>
                <p className="text-xs text-red-600 mb-6">
                  Please contact the dataset owner and request that they add your wallet address 
                  ({address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'your address'}) 
                  to the authorized recipients list.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-xs text-red-800">
                    <Icon name="shield" size={14} className="inline mr-1" />
                    This ensures your privacy and data sovereignty - only explicitly trusted parties can access sensitive training data.
                  </p>
                </div>
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
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white">
                  <Icon name="check" size={20} />
                </div>
                <h3>Dataset Content</h3>
              </div>
              
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <Icon name="unlock" size={16} className="inline mr-2" />
                  Successfully decrypted! This data has been shared with you for AI training or research purposes.
                </p>
              </div>
              
              <div className="card bg-[var(--color-secondary)] p-6 mb-6 border-2 border-[var(--color-border)]">
                <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96 leading-relaxed">
                  {decryptedContent}
                </pre>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(decryptedContent);
                    notification.success("Dataset content copied to clipboard!");
                  }}
                  className="btn-outline flex items-center gap-2"
                >
                  <Icon name="copy" size={18} />
                  Copy Content
                </button>
                
                <button
                  onClick={() => {
                    const blob = new Blob([decryptedContent], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dataset-${currentCID?.slice(0, 8)}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    notification.success("Dataset downloaded!");
                  }}
                  className="btn-outline flex items-center gap-2"
                >
                  <Icon name="download" size={18} />
                  Download File
                </button>
              </div>

              <div className="mt-6 bg-[var(--color-secondary)] p-4 rounded-lg">
                <p className="text-xs text-muted">
                  <Icon name="info" size={14} className="inline mr-1" />
                  Remember to use this data responsibly and in accordance with any agreements you have with the data owner.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
