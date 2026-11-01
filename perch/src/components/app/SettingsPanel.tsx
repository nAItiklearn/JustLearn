"use client";

import { useState } from "react";
import type { Settings } from "@/lib/types";

export function SettingsPanel({ settings, onSave, busy }: { settings?: Partial<Settings>; onSave: (s: Partial<Settings>) => void; busy: boolean }) {
  const [draft, setDraft] = useState<Partial<Settings>>(settings ?? {});
  const [open, setOpen] = useState(false);
  if (!settings) return null;
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[14.5px] font-medium">Shelf settings</div>
          <div className="text-[12px] text-[var(--ink-faint)]">Auto-clean thresholds — Perch drops ended items after these windows.</div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="text-[13px] text-[var(--accent)]">
          {open ? "Close" : "Edit"}
        </button>
      </div>
      {open && (
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {[
            { key: "graceDays", label: "Days after end → 'ended'", max: 30 },
            { key: "cleanupDays", label: "Days after ended → dropped", max: 365 },
            { key: "idleDays", label: "Days quiet before 'maybe unused'", max: 730 },
            { key: "cancelledDropDays", label: "Days after cancelled → dropped", max: 365 },
          ].map((f) => (
            <label key={f.key} className="block">
              <span className="text-[12.5px] text-[var(--ink-soft)]">{f.label}</span>
              <input
                type="number"
                min={0}
                max={f.max}
                value={draft[f.key as keyof Settings] ?? settings[f.key as keyof Settings] ?? 0}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: Number(e.target.value) }))}
                className="mt-1 w-full rounded border hairline px-2 py-1.5 text-[13px] bg-[var(--card)]"
              />
            </label>
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <button
              disabled={busy}
              onClick={() => onSave(draft)}
              className="rounded-full bg-[var(--accent)] text-white text-[13px] font-medium px-4 py-1.5 disabled:opacity-50"
            >
              Save settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
