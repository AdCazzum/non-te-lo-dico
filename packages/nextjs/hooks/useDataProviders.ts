"use client";

import { useEffect, useRef, useState } from "react";
import { FhevmInstance, useFHEDecrypt, useInMemoryStorage } from "@fhevm-sdk";
import { useAccount } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import { useWagmiEthers } from "~~/hooks/wagmi/useWagmiEthers";

export interface ProviderData {
  id: string; // Anonymous identifier (e.g., "Provider #1")
  fileCount: number;
  totalPrice?: bigint; // Decrypted total price (if accessible)
  encryptedTotalPrice?: string; // Encrypted total price handle (euint128)
  isDecrypting: boolean;
  decryptError?: string;
}

/**
 * Hook to fetch and manage data providers statistics
 * @param fhevmInstance - FHEVM instance for decryption
 * @returns Provider statistics with anonymous labels and encrypted total prices
 */
export function useDataProviders(fhevmInstance?: FhevmInstance) {
  const { address: userAddress, chain } = useAccount();
  const chainId = chain?.id;
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [decryptRequests, setDecryptRequests] = useState<Array<{ handle: string; contractAddress: `0x${string}` }>>([]);
  const { ethersProvider, ethersSigner } = useWagmiEthers();
  const { storage: decryptionStorage } = useInMemoryStorage();
  const hasTriggeredDecrypt = useRef(false);

  // Get contract configuration
  const contractConfig = chainId && deployedContracts[chainId as keyof typeof deployedContracts]?.FHEIPFSStorage;

  // Setup FHE decryption
  const {
    results: decryptResults,
    decrypt,
    isDecrypting: isFHEDecrypting,
    error: decryptError,
  } = useFHEDecrypt({
    instance: fhevmInstance,
    ethersSigner,
    fhevmDecryptionSignatureStorage: decryptionStorage,
    chainId,
    requests: decryptRequests,
  });

  // Fetch and process provider stats
  useEffect(() => {
    const fetchProviderStats = async () => {
      if (!contractConfig || typeof contractConfig !== "object" || !ethersProvider || !userAddress || !ethersSigner) {
        setProviders([]);
        return;
      }

      try {
        setIsLoading(true);

        // Create contract instance
        const { ethers } = await import("ethers");
        const contract = new ethers.Contract(contractConfig.address, contractConfig.abi, ethersSigner);

        // Call getProviderStats (non-view function that returns data via staticCall)
        const providerStats = await contract.getProviderStats.staticCall();

        if (!providerStats || !Array.isArray(providerStats)) {
          setProviders([]);
          setIsLoading(false);
          return;
        }

        // Process provider stats and create decrypt requests
        const processedProviders: ProviderData[] = providerStats.map((stat: any, i: number) => ({
          id: `Provider #${i + 1}`,
          fileCount: Number(stat.fileCount),
          encryptedTotalPrice: stat.totalPrice ? stat.totalPrice.toString() : undefined,
          isDecrypting: stat.totalPrice ? true : false,
        }));

        setProviders(processedProviders);
        setIsLoading(false);

        // Setup decrypt requests for all provider prices
        if (fhevmInstance && processedProviders.length > 0) {
          const requests = processedProviders
            .filter(p => p.encryptedTotalPrice)
            .map(provider => ({
              handle: provider.encryptedTotalPrice!,
              contractAddress: contractConfig.address as `0x${string}`,
            }));

          // Reset the trigger flag when new requests are created
          hasTriggeredDecrypt.current = false;
          setDecryptRequests(requests);
        }
      } catch (error) {
        console.error("Error fetching provider stats:", error);
        setProviders([]);
        setIsLoading(false);
      }
    };

    fetchProviderStats();
  }, [contractConfig, ethersProvider, ethersSigner, userAddress, fhevmInstance, chainId]);

  // Trigger decryption when requests are ready
  useEffect(() => {
    if (decryptRequests.length > 0 && ethersSigner && !hasTriggeredDecrypt.current) {
      console.log("🔐 Starting decryption with requests:", decryptRequests);
      hasTriggeredDecrypt.current = true;

      // Use setTimeout to ensure everything is ready
      setTimeout(() => {
        decrypt();
      }, 500);
    }
  }, [decryptRequests, ethersSigner, decrypt]);

  // Update providers with decrypted prices
  useEffect(() => {
    console.log("Decrypt results update:", {
      resultsKeys: Object.keys(decryptResults || {}),
      results: decryptResults,
      error: decryptError,
      isDecrypting: isFHEDecrypting,
    });

    // Handle decrypt errors
    if (decryptError) {
      console.error("Decryption error:", decryptError);
      setProviders(prev =>
        prev.map(provider => ({
          ...provider,
          isDecrypting: false,
          decryptError: "Failed to decrypt price",
        })),
      );
      return;
    }

    if (decryptResults && Object.keys(decryptResults).length > 0) {
      console.log("✅ Processing decrypted results!");
      setProviders(prev =>
        prev.map(provider => {
          if (provider.encryptedTotalPrice && decryptResults[provider.encryptedTotalPrice] !== undefined) {
            const decryptedValue = decryptResults[provider.encryptedTotalPrice];
            console.log(`Decrypted value for ${provider.id}:`, decryptedValue);
            return {
              ...provider,
              totalPrice: typeof decryptedValue === "bigint" ? decryptedValue : BigInt(decryptedValue.toString()),
              isDecrypting: false,
              decryptError: undefined,
            };
          }
          return provider;
        }),
      );
    }
  }, [decryptResults, decryptError, isFHEDecrypting]);

  const isLoadingPrices = providers.some(p => p.isDecrypting);

  return {
    providers,
    isLoading,
    isLoadingPrices,
  };
}
