"use client";

import React from "react";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "~~/components/helper";
import { Icon } from "~~/components/Icon";

/**
 * Minimal site header
 */
export const Header = () => {
  return (
    <header className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
      <nav className="container-minimal">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Icon name="shield" size={24} className="text-[var(--color-foreground)]" />
            <span className="text-lg font-medium tracking-tight">Secure Files</span>
          </Link>

          {/* Wallet Connection */}
          <div className="flex items-center">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </nav>
    </header>
  );
};
