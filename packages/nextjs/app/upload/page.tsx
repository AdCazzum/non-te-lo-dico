"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFhevm } from "@fhevm-sdk";
import { useAccount } from "wagmi";
import { Icon } from "~~/components/Icon";
import { PinataSetupInstructions } from "~~/components/PinataSetupInstructions";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useCombinedIPFSUpload } from "~~/hooks/useCombinedIPFS";
import { useFHEIPFSStorage } from "~~/hooks/useFHEIPFSStorage";
import { encryptFile, generateEncryptionKey } from "~~/utils/crypto";
import { notification } from "~~/utils/helper/notification";

export default function UploadPage() {
  const { isConnected, chain } = useAccount();
  const chainId = chain?.id;

  // Check if Pinata is configured
  const isPinataConfigured = useMemo(() => {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    return jwt && jwt !== "your_pinata_jwt_token_here" && jwt.length > 0;
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

      // Step 2: Encrypt file
      const fileContent = await selectedFile.arrayBuffer();
      const encryptedContent = await encryptFile(fileContent, key);

      // Step 3: Upload encrypted file to IPFS
      const cid = await uploadToIPFS(encryptedContent, `encrypted_${selectedFile.name}`);

      if (!cid) {
        throw new Error("Failed to upload to IPFS");
      }

      setUploadedCID(cid);

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
              To upload and share encrypted datasets, please connect your Ethereum wallet. This ensures secure access
              control and cryptographic proof of ownership.
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
            <Icon name="upload" size={32} className="text-[var(--color-primary)]" />
            <h1>Upload Training Dataset</h1>
          </div>
          <p className="text-muted text-lg">
            Securely share your AI training data with trusted organizations. Your data is encrypted client-side and
            stored on IPFS, with decryption keys protected by ZAMA&apos;s FHE technology.
          </p>
        </div>

        {/* Security Info Banner */}
        <div className="card p-6 mb-8 bg-[var(--color-surface)] border-l-4 border-[var(--color-primary)]">
          <div className="flex items-start gap-4">
            <Icon name="shield" size={24} className="text-[var(--color-primary)] flex-shrink-0 mt-1" />
            <div>
              <h4 className="mb-2 font-semibold">Your Data Remains Private</h4>
              <p className="text-sm text-muted">
                Files are encrypted on your device before upload. Only addresses you explicitly grant access to can
                decrypt and view your data. The blockchain ensures transparent and immutable access control.
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
                <p className="text-sm text-[var(--color-foreground)]">Initializing FHEVM...</p>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="card p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <Icon name="x" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Upload Error</p>
                  <p className="text-sm text-red-700 mt-1">{uploadError}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Make sure you have configured NEXT_PUBLIC_PINATA_JWT in your .env file
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isPinataConfigured && <PinataSetupInstructions />}

          {uploadMethod && (
            <div className="card p-4 border-l-4 border-green-500 bg-green-50">
              <div className="flex items-start gap-3">
                <Icon name="check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-900">Uploaded successfully via {uploadMethod}</p>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold">
                1
              </div>
              <h3>Select Your Dataset</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Choose a text file containing training data</label>
                <p className="text-xs text-muted mb-3">
                  Supported formats: .txt, .json, .csv, .md, or any text-based file for AI training
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="input-field"
                  disabled={isProcessing || isUploading}
                />
                {selectedFile && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <Icon name="file" size={16} />
                    <span>{selectedFile.name}</span>
                    <span className="text-xs">({(selectedFile.size / 1024).toFixed(2)} KB)</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isProcessing || isUploading || !fhevmInstance}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isProcessing || isUploading ? (
                  <>
                    <Icon name="loading" size={18} className="text-[#0f0f0f]" />
                    Encrypting and Uploading...
                  </>
                ) : (
                  <>
                    <Icon name="lock" size={18} />
                    Encrypt & Upload to IPFS
                  </>
                )}
              </button>

              <div className="bg-[var(--color-secondary)] p-4 rounded-lg">
                <p className="text-xs text-muted">
                  <Icon name="info" size={14} className="inline mr-1" />
                  Your file will be encrypted locally using AES-256 before uploading to IPFS. The encryption key will be
                  protected with ZAMA&apos;s FHE and stored on-chain.
                </p>
              </div>

              {encryptionKey && (
                <div className="card p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-start gap-3">
                    <Icon name="key" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Encryption key generated</p>
                      <p className="text-xs text-green-700 mt-1 font-mono">{encryptionKey}</p>
                    </div>
                  </div>
                </div>
              )}

              {uploadedCID && (
                <div className="card p-4 border-l-4 border-green-500 bg-green-50">
                  <div className="flex items-start gap-3">
                    <Icon name="check" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-2">File uploaded successfully!</p>
                      <p className="text-xs text-green-700 break-all font-mono">IPFS CID: {uploadedCID}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grant Access Section */}
          {uploadedCID && (
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold">
                  2
                </div>
                <h3>Grant Access to Trusted Parties</h3>
              </div>

              <p className="text-sm text-muted mb-6">
                Control who can decrypt your dataset by adding their Ethereum wallet addresses. Only these addresses
                will be able to access the decryption key through ZAMA&apos;s ACL system.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">Recipient&apos;s Ethereum Address</label>
                  <input
                    type="text"
                    value={granteeAddress}
                    onChange={e => setGranteeAddress(e.target.value)}
                    placeholder="0x..."
                    className="input-field"
                  />
                  <p className="text-xs text-muted mt-2">
                    Enter the wallet address of the AI company, researcher, or organization you trust
                  </p>
                </div>

                <button
                  onClick={handleGrantAccess}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Icon name="key" size={18} />
                  Grant Decryption Access
                </button>
              </div>
            </div>
          )}

          {/* Share Link Section */}
          {uploadedCID && (
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold">
                  3
                </div>
                <h3>Share Access Link</h3>
              </div>

              <p className="text-sm text-muted mb-6">
                Share this link with authorized recipients. They can use it to retrieve and decrypt your dataset (only
                if you&apos;ve granted them access).
              </p>

              <div className="space-y-4">
                <div className="card bg-[var(--color-secondary)] p-4">
                  <p className="text-xs text-muted mb-2">Secure Access Link</p>
                  <p className="text-sm break-all font-mono text-[var(--color-foreground)]">{generateShareLink()}</p>
                </div>

                <button onClick={handleCopyLink} className="btn-outline w-full flex items-center justify-center gap-2">
                  <Icon name="copy" size={18} />
                  Copy Share Link
                </button>

                <div className="bg-[var(--color-secondary)] p-4 rounded-lg">
                  <p className="text-xs text-muted">
                    <Icon name="info" size={14} className="inline mr-1" />
                    This link is safe to share publicly. Only wallets with explicit access grants can decrypt the data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* My Files Section */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="file" size={24} className="text-[var(--color-primary)]" />
              <h3>My Shared Datasets</h3>
            </div>

            <p className="text-sm text-muted mb-6">View and manage all datasets you&apos;ve uploaded to the platform</p>

            {storage.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-[var(--color-primary)]">
                <Icon name="loading" size={20} />
                <span>Loading your datasets...</span>
              </div>
            ) : storage.myFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--color-secondary)]">
                  <Icon name="file" size={24} className="text-muted" />
                </div>
                <p className="text-muted">No datasets uploaded yet</p>
                <p className="text-sm text-muted mt-2">Upload your first training dataset to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {storage.myFiles.map((file, index) => (
                  <div key={index} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="file" size={16} className="text-[var(--color-primary)]" />
                          <p className="text-sm font-medium">Dataset #{index + 1}</p>
                        </div>
                        <p className="text-xs text-muted break-all font-mono mb-2">CID: {file.cid}</p>
                        <p className="text-xs text-muted">
                          Uploaded: {new Date(Number(file.timestamp) * 1000).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/retrieve?cid=${file.cid}`}
                        className="btn-outline flex items-center gap-2 whitespace-nowrap text-sm py-2 px-4"
                      >
                        <Icon name="search" size={16} />
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
