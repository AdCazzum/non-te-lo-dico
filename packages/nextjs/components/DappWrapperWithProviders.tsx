"use client";

import { useEffect, useState } from "react";
import { InMemoryStorageProvider } from "@fhevm-sdk";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useTheme } from "next-themes";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/helper";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const DappWrapperWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          avatar={BlockieAvatar}
          theme={darkTheme({
            accentColor: '#f5c842',
            accentColorForeground: '#0f0f0f',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
        >
          <ProgressBar height="3px" color="#f5c842" />
          <div className={`flex flex-col min-h-screen`}>
            <Header />
            <main className="relative flex flex-col flex-1">
              <InMemoryStorageProvider>{children}</InMemoryStorageProvider>
            </main>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#e5e5e5',
                border: '1px solid #2a2a2a',
                padding: '16px',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                maxWidth: '400px',
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#1a1a1a',
                },
                style: {
                  borderLeft: '4px solid #4ade80',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f87171',
                  secondary: '#1a1a1a',
                },
                style: {
                  borderLeft: '4px solid #f87171',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#f5c842',
                  secondary: '#1a1a1a',
                },
                style: {
                  borderLeft: '4px solid #f5c842',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
