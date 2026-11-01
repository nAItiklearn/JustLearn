"use client";

import { useEffect, useState } from "react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("perch_theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-full border hairline px-3 py-1.5 text-[13px] text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
    >
      {compact ? <span aria-hidden>{dark ? "○" : "●"}</span> : dark ? "Day" : "Night"}
    </button>
  );
}
