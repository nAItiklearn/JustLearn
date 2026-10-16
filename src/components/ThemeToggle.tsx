"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tmrh_theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tmrh_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tmrh_theme", "light");
    }
  };

  // Prevent hydration mismatch while mounting
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-neutral-500 transition-colors p-1"
      >
        <Moon className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle night theme"
      title={theme === "light" ? "Switch to night theme" : "Switch to light theme"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all p-1 cursor-pointer"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 stroke-[1.8]" />
      ) : (
        <Sun className="h-4 w-4 stroke-[1.8] text-amber-300" />
      )}
    </button>
  );
}
