"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Deep Dive" },
    { href: "/community", label: "Community" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent transition-colors duration-300">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
        {/* Top Left: Moon Symbol (Theme Toggle) + Brand Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Small transparent moon symbol at top left */}
          <ThemeToggle />

          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="relative flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center">
              <span className="absolute h-1.5 w-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
              <span className="absolute inset-0 rounded-full border border-amber-400/50 group-hover:border-amber-500 transition-colors" />
              <span className="absolute -inset-1 rounded-full border border-amber-400/20" />
            </div>
            <span className="text-xs sm:text-sm tracking-[0.18em] uppercase font-semibold text-neutral-900 dark:text-white transition-colors">
              TenMin<span className="text-amber-500 font-normal">Hole</span>
            </span>
          </Link>
        </div>

        {/* Text Navigation Links (transparent bar, black text in light, white in dark) */}
        <nav className="flex items-center space-x-4 sm:space-x-8">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-xs sm:text-sm tracking-tight transition-colors duration-150 py-1 ${
                  isActive
                    ? "text-neutral-950 dark:text-white font-semibold underline underline-offset-8 decoration-amber-400 decoration-2"
                    : "text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white font-medium"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button (desktop) */}
        <div className="hidden md:flex items-center">
          <Link
            href="/"
            className="group flex items-center space-x-2 rounded-full border border-black/15 dark:border-white/20 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-black dark:hover:bg-neutral-100 px-3.5 py-1.5 text-xs font-medium transition-all shadow-xs"
          >
            <span>Roll Topic</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
