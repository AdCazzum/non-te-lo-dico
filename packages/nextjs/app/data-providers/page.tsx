"use client";

import { useMemo } from "react";
import { useFhevm } from "@fhevm-sdk";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { Icon } from "~~/components/Icon";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import { useDataProviders } from "~~/hooks/useDataProviders";

export default function DataProvidersPage() {
  const { isConnected, chain } = useAccount();
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

  const { providers, isLoading } = useDataProviders(fhevmInstance);

  return (
    <main className="section-padding">
      <div className="container-minimal max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="users" size={32} className="text-[var(--color-primary)]" />
            <h1>Data Providers</h1>
          </div>
          <p className="text-muted text-lg">
            View anonymized statistics about data providers who have uploaded datasets to the platform. All provider
            identities are protected while maintaining transparency about platform activity.
          </p>
        </div>

        {/* Wallet Connection Check */}
        {!isConnected ? (
          <div className="max-w-2xl mx-auto">
            <div className="card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[var(--color-surface-hover)]">
                <Icon name="lock" size={32} className="text-[var(--color-muted)]" />
              </div>
              <h2 className="mb-4">Connect Your Wallet</h2>
              <p className="text-muted mb-8">
                Connect your wallet to view data provider statistics and explore the platform&apos;s activity.
              </p>
              <div className="flex justify-center">
                <RainbowKitCustomConnectButton />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* FHEVM Status */}
            {fhevmStatus !== "ready" && (
              <div className="max-w-2xl mx-auto mb-8">
                <div className="card p-6 bg-[var(--color-surface-hover)]">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <Icon name="loader" size={20} className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium">Initializing FHEVM...</p>
                      <p className="text-sm text-muted">
                        {fhevmStatus === "loading" && "Loading encryption instance..."}
                        {fhevmStatus === "error" && `Error: ${fhevmError?.message || "Failed to load FHEVM"}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Provider Statistics Cards */}
            <div>
              {isLoading ? (
                <div className="card p-12 text-center">
                  <div className="animate-spin mx-auto mb-4">
                    <Icon name="loader" size={32} className="text-[var(--color-primary)]" />
                  </div>
                  <p className="text-muted">Loading provider statistics...</p>
                </div>
              ) : providers.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-[var(--color-primary)]">
                    <Icon name="inbox" size={32} className="text-black" />
                  </div>
                  <h2 className="mb-4">No Data Providers Yet</h2>
                  <p className="text-muted mb-8">
                    No datasets have been uploaded to the platform yet. Be the first to share your data!
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="users" size={20} className="text-[var(--color-primary)]" />
                        <h3 className="text-sm font-medium text-muted">Total Providers</h3>
                      </div>
                      <p className="text-3xl font-bold">{providers.length}</p>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="file" size={20} className="text-[var(--color-primary)]" />
                        <h3 className="text-sm font-medium text-muted">Total Datasets</h3>
                      </div>
                      <p className="text-3xl font-bold">{providers.reduce((sum, p) => sum + p.fileCount, 0)}</p>
                    </div>
                  </div>

                  {/* Provider List */}
                  <div className="space-y-4">
                    {providers.map((provider, index) => (
                      <div key={provider.id} className="card p-6 hover:border-[var(--color-primary)] transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-black font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{provider.id}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted">
                                <div className="flex items-center gap-1">
                                  <Icon name="file" size={14} className="text-[var(--color-primary)]" />
                                  <span>
                                    {provider.fileCount} {provider.fileCount === 1 ? "dataset" : "datasets"}
                                  </span>
                                </div>
                                {provider.isDecrypting && (
                                  <div className="flex items-center gap-1">
                                    <Icon name="loading" size={14} className="text-[var(--color-primary)]" />
                                    <span>Decrypting</span>
                                  </div>
                                )}
                                {provider.totalPrice !== undefined && !provider.isDecrypting && (
                                  <div className="flex items-center gap-1">
                                    <Icon name="dollar" size={14} />
                                    <span>Total: {formatEther(provider.totalPrice)} ETH</span>
                                  </div>
                                )}
                                {provider.decryptError && (
                                  <div className="flex items-center gap-1 text-red-500">
                                    <Icon name="alert" size={14} />
                                    <span>{provider.decryptError}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 rounded-full bg-[var(--color-surface-hover)] text-xs font-medium">
                              Anonymous
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Privacy Notice */}
                  <div className="card p-6 bg-[var(--color-surface-hover)] mt-8">
                    <div>
                      <h3 className="font-semibold mb-2">Privacy Protection</h3>
                      <p className="text-sm text-muted leading-relaxed">
                        All provider addresses are anonymized to protect their identity. File counts are public, but
                        prices are encrypted using ZAMA&apos;s Fully Homomorphic Encryption (FHE) technology. Only
                        authorized parties can decrypt and view pricing information.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
