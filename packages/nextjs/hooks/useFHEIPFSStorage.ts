import { useState, useCallback, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/helper";
import { FhevmInstance } from "@fhevm-sdk";
import { notification } from "~~/utils/helper/notification";
import type { AllowedChainIds } from "~~/utils/helper/networks";
import { toHex } from "viem";

export interface FileMetadata {
  cid: string;
  owner: string;
  timestamp: bigint;
}

export function useFHEIPFSStorage(fhevmInstance: FhevmInstance | undefined) {
  const { address: connectedAddress, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { writeContractAsync } = useWriteContract();
  
  const allowedChainId = typeof chainId === "number" ? (chainId as AllowedChainIds) : undefined;
  const { data: contractInfo } = useDeployedContractInfo({ 
    contractName: "FHEIPFSStorage", 
    chainId: allowedChainId 
  });

  const [myFiles, setMyFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's files
  const loadMyFiles = useCallback(async () => {
    if (!connectedAddress || !contractInfo || !publicClient) return;

    setIsLoading(true);
    try {
      const cids = (await publicClient.readContract({
        address: contractInfo.address as `0x${string}`,
        abi: contractInfo.abi,
        functionName: "getOwnerFiles",
        args: [connectedAddress],
      })) as string[];

      const filesData: FileMetadata[] = [];
      
      for (const cid of cids) {
        const [owner, timestamp] = (await publicClient.readContract({
          address: contractInfo.address as `0x${string}`,
          abi: contractInfo.abi,
          functionName: "getFileMetadata",
          args: [cid],
        })) as [string, bigint];

        filesData.push({
          cid,
          owner,
          timestamp,
        });
      }

      setMyFiles(filesData);
    } catch (error) {
      console.error("Error loading files:", error);
      notification.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, [connectedAddress, contractInfo, publicClient]);

  // Load files on mount
  useEffect(() => {
    if (connectedAddress && contractInfo) {
      loadMyFiles();
    }
  }, [connectedAddress, contractInfo, loadMyFiles]);

  // Store file on blockchain
  const storeFile = useCallback(
    async (cid: string, encryptionKey: number) => {
      if (!contractInfo || !fhevmInstance || !connectedAddress) {
        notification.error("Wallet not connected or FHEVM not initialized");
        return false;
      }

      try {
        // Encrypt the key with FHEVM
        const input = fhevmInstance.createEncryptedInput(contractInfo.address as `0x${string}`, connectedAddress);
        input.add32(encryptionKey);
        const encryptedInput = await input.encrypt();

        console.log("Encrypted input:", encryptedInput);
        console.log("Handle type:", typeof encryptedInput.handles[0]);
        console.log("Handle value:", encryptedInput.handles[0]);
        console.log("InputProof type:", typeof encryptedInput.inputProof);
        console.log("InputProof value:", encryptedInput.inputProof);

        // Convert handles and inputProof to proper hex format
        // handles[0] might be Uint8Array or already a string
        const encryptedHandle = typeof encryptedInput.handles[0] === 'string'
          ? encryptedInput.handles[0]
          : toHex(encryptedInput.handles[0]);
        
        const inputProof = typeof encryptedInput.inputProof === 'string'
          ? encryptedInput.inputProof
          : toHex(encryptedInput.inputProof);

        console.log("Converted handle:", encryptedHandle);
        console.log("Converted inputProof:", inputProof);

        // Call storeFile
        const hash = await writeContractAsync({
          address: contractInfo.address as `0x${string}`,
          abi: contractInfo.abi,
          functionName: "storeFile",
          args: [cid, encryptedHandle, inputProof],
        });

        notification.info("Transaction submitted. Waiting for confirmation...");
        
        // Wait for transaction
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }

        notification.success("File stored successfully!");
        await loadMyFiles();
        return true;
      } catch (error: any) {
        console.error("Error storing file:", error);
        notification.error(error?.message || "Failed to store file");
        return false;
      }
    },
    [contractInfo, fhevmInstance, connectedAddress, writeContractAsync, publicClient, loadMyFiles]
  );

  // Grant access to a file
  const grantAccess = useCallback(
    async (cid: string, granteeAddress: string) => {
      if (!contractInfo || !writeContractAsync) {
        notification.error("Wallet not connected");
        return false;
      }

      try {
        const hash = await writeContractAsync({
          address: contractInfo.address as `0x${string}`,
          abi: contractInfo.abi,
          functionName: "grantAccess",
          args: [cid, granteeAddress as `0x${string}`],
        });

        notification.info("Granting access...");
        
        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash });
        }

        notification.success("Access granted successfully!");
        return true;
      } catch (error: any) {
        console.error("Error granting access:", error);
        notification.error(error?.message || "Failed to grant access");
        return false;
      }
    },
    [contractInfo, writeContractAsync, publicClient]
  );

  // Get encrypted key (this will return the encrypted handle)
  const getEncryptedKey = useCallback(
    async (cid: string) => {
      if (!contractInfo || !publicClient) {
        notification.error("Contract not initialized");
        return null;
      }

      try {
        const encryptedKey = await publicClient.readContract({
          address: contractInfo.address as `0x${string}`,
          abi: contractInfo.abi,
          functionName: "getEncryptedKey",
          args: [cid],
        });

        console.log("Raw encrypted key from contract:", encryptedKey, "Type:", typeof encryptedKey);
        console.log("Is Array?", Array.isArray(encryptedKey));
        console.log("Constructor:", encryptedKey?.constructor?.name);
        console.log("Stringified:", JSON.stringify(encryptedKey));

        // euint32 is returned as bytes32, which viem gives us as a hex string
        // We need to ensure it's properly formatted for useFHEDecrypt
        let hexHandle: string;
        
        if (typeof encryptedKey === 'string') {
          // If it's already a string, ensure it's properly formatted
          hexHandle = encryptedKey.startsWith('0x') ? encryptedKey : `0x${encryptedKey}`;
        } else if (typeof encryptedKey === 'bigint') {
          hexHandle = toHex(encryptedKey, { size: 32 });
        } else if (typeof encryptedKey === 'object' && encryptedKey !== null) {
          // If it's an object or array, try to extract the value
          const value = Array.isArray(encryptedKey) ? encryptedKey[0] : (encryptedKey as any).value || encryptedKey;
          if (typeof value === 'string') {
            hexHandle = value.startsWith('0x') ? value : `0x${value}`;
          } else if (typeof value === 'bigint') {
            hexHandle = toHex(value, { size: 32 });
          } else {
            // Last resort: convert to string
            hexHandle = String(value);
            if (!hexHandle.startsWith('0x')) {
              hexHandle = `0x${hexHandle}`;
            }
          }
        } else {
          // Fallback - convert to hex
          hexHandle = toHex(encryptedKey as any);
        }
        
        console.log("Converted hex handle:", hexHandle);
        console.log("Handle length:", hexHandle.length, "Expected: 66 (0x + 64 hex chars)");
        
        return hexHandle;
      } catch (error: any) {
        console.error("Error getting encrypted key:", error);
        notification.error(error?.message || "Failed to get key. You may not have access.");
        return null;
      }
    },
    [contractInfo, publicClient]
  );

  // Check if file exists
  const fileExists = useCallback(
    async (cid: string): Promise<boolean> => {
      if (!contractInfo || !publicClient) return false;

      try {
        const exists = (await publicClient.readContract({
          address: contractInfo.address as `0x${string}`,
          abi: contractInfo.abi,
          functionName: "fileExists",
          args: [cid],
        })) as boolean;

        return exists;
      } catch (error) {
        console.error("Error checking file existence:", error);
        return false;
      }
    },
    [contractInfo, publicClient]
  );

  // Get file metadata
  const getFileMetadata = useCallback(
    async (cid: string): Promise<{ owner: string; timestamp: bigint } | null> => {
      if (!contractInfo || !publicClient) return null;

      try {
        const [owner, timestamp] = (await publicClient.readContract({
          address: contractInfo.address as `0x${string}`,
          abi: contractInfo.abi,
          functionName: "getFileMetadata",
          args: [cid],
        })) as [string, bigint];

        return { owner, timestamp };
      } catch (error) {
        console.error("Error getting file metadata:", error);
        return null;
      }
    },
    [contractInfo, publicClient]
  );

  return {
    contractAddress: contractInfo?.address,
    contractAbi: contractInfo?.abi,
    myFiles,
    isLoading,
    loadMyFiles,
    storeFile,
    grantAccess,
    getEncryptedKey,
    fileExists,
    getFileMetadata,
  };
}

