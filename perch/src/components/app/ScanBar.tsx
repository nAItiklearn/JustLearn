"use client";

import { useState } from "react";

export function ScanBar({ email, mode, lastSyncedAt, busy, onScan, onDisconnect }: {
  email: string; mode: string; lastSyncedAt: string | null; busy: boolean;
  onScan: () => void; onDisconnect: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
          <span className="text-[14px] font-medium truncate">{email}</span>
          {mode === "demo" && <span className="text-[11px] bg-[var(--amber-soft)] text-[var(--amber)] px-1.5 py-0.5 rounded-full">demo</span>}
        </div>
        <div className="text-[12px] text-[var(--ink-faint)] mt-0.5">
          {lastSyncedAt ? `Last scan ${new Date(lastSyncedAt).toLocaleString()}` : "Never scanned yet"}
          {mode === "google" ? " · rescans every 2 minutes while this tab is open" : " · simulated scan"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={busy}
          onClick={onScan}
          className="rounded-full bg-[var(--accent)] text-white text-[13px] font-medium px-4 py-1.5 hover:opacity-90 disabled:opacity-50 transition"
        >
          {busy ? "Scanning…" : "Scan now"}
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="rounded-full border hairline text-[13px] px-3 py-1.5 hover:bg-[var(--card)]">
            ···
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border hairline bg-[var(--card)] shadow-lg py-1 z-10">
              <button
                onClick={() => { setMenuOpen(false); onDisconnect(); }}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[color-mix(in_srgb,var(--paper)_60%,transparent)]"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
