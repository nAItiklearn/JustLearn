"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (t: "light" | "dark") => {
    setTheme(t);
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("tmrh_theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      localStorage.setItem("tmrh_theme", "light");
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("tmrh_theme");
    if (saved === "dark") {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-neutral-700 p-1"
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
      className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-neutral-800 hover:text-black dark:text-neutral-200 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all p-1 cursor-pointer"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 stroke-[2]" />
      ) : (
        <Sun className="h-4 w-4 stroke-[2] text-amber-300" />
      )}
    </button>
  );
}
