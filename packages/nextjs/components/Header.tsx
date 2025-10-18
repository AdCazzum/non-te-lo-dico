"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "~~/components/Icon";
import { RainbowKitCustomConnectButton } from "~~/components/helper";

/**
 * Site header with integrated sidebar menu
 */
export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Home",
      icon: "home",
      path: "/",
      description: "How the platform works",
    },
    {
      name: "Upload Dataset",
      icon: "upload",
      path: "/upload",
      description: "Share encrypted AI training data",
    },
    {
      name: "Retrieve Dataset",
      icon: "download",
      path: "/retrieve",
      description: "Access shared data securely",
    },
    {
      name: "Data Providers",
      icon: "users",
      path: "/data-providers",
      description: "View provider statistics",
    },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-50">
        <nav className="container-minimal">
          <div className="flex items-center justify-between h-20">
            {/* Menu Button + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger Button */}
              <button
                onClick={toggleMenu}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-all duration-200 group"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span
                    className={`block h-0.5 w-full bg-[var(--color-foreground)] group-hover:bg-[var(--color-primary)] rounded-full transition-all duration-300 ${
                      isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-full bg-[var(--color-foreground)] group-hover:bg-[var(--color-primary)] rounded-full transition-all duration-300 ${
                      isMenuOpen ? "opacity-0 scale-0" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-full bg-[var(--color-foreground)] group-hover:bg-[var(--color-primary)] rounded-full transition-all duration-300 ${
                      isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Logo / Brand */}
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Icon name="vault" size={24} />
                <span className="text-xl font-medium tracking-tight">non-te-lo-dico</span>
              </Link>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center">
              <RainbowKitCustomConnectButton />
            </div>
          </div>
        </nav>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-all duration-300 z-40 ${
          isMenuOpen ? "opacity-60 visible backdrop-blur-sm" : "opacity-0 invisible"
        }`}
        onClick={toggleMenu}
      />

      {/* Sidebar Menu */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[var(--color-surface)] border-r-2 border-[var(--color-border)] z-40 transition-all duration-300 ease-out ${
          isMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"
        }`}
        style={{
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-20 px-6 border-b-2 border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                <Icon name="vault" size={24} className="text-black" />
              </div>
              <div>
                <span className="text-lg font-semibold block">Menu</span>
                <p className="text-xs text-[var(--color-muted)]">Main navigation</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map(item => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={toggleMenu}
                      className={`flex items-start gap-3 px-4 py-4 rounded-xl group ${
                        isActive
                          ? "bg-[var(--color-primary)] text-black shadow-lg"
                          : "text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] hover:shadow-md"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-black bg-opacity-10"
                            : "bg-[var(--color-border)] group-hover:bg-[var(--color-border-hover)]"
                        }`}
                      >
                        <Icon name={item.icon} size={20} className={isActive ? "" : "text-[var(--color-foreground)]"} />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium mb-0.5 ${isActive ? "text-black" : ""}`}>{item.name}</div>
                        <div
                          className={`text-xs ${isActive ? "text-black text-opacity-70" : "text-[var(--color-muted)]"}`}
                        >
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};
