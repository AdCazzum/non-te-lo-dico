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
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-50">
      <nav className="container-minimal">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <Icon name="vault" size={24} />
            <span className="text-xl font-medium tracking-tight">non-te-lo-dico</span>
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
