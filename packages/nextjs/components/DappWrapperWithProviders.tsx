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
            position="bottom-right"
            containerStyle={{
              bottom: '1rem',
              right: '1rem',
              position: 'fixed',
              zIndex: 9999,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#e5e5e5',
                border: '2px solid #3a3a3a',
                padding: '18px 20px',
                borderRadius: '0.75rem',
                fontSize: '0.9375rem',
                fontWeight: '500',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.8), 0 10px 10px -5px rgb(0 0 0 / 0.4)',
                maxWidth: '420px',
                minWidth: '320px',
                zIndex: 9999,
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#1a1a1a',
                },
                style: {
                  background: '#1a1a1a',
                  borderLeft: '5px solid #4ade80',
                  border: '2px solid #4ade80',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f87171',
                  secondary: '#1a1a1a',
                },
                style: {
                  background: '#1a1a1a',
                  borderLeft: '5px solid #f87171',
                  border: '2px solid #f87171',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#f5c842',
                  secondary: '#1a1a1a',
                },
                style: {
                  background: '#1a1a1a',
                  borderLeft: '5px solid #f5c842',
                  border: '2px solid #f5c842',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
