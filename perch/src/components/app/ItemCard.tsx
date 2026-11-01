"use client";

import { useState } from "react";
import type { Item } from "@/lib/types";
import { moneyLabel, formatRefDate, urgencyFor } from "@/lib/snapshot";
import type { RenewalRow } from "@/lib/snapshot";

interface ItemCardProps {
  row: RenewalRow | { item: Item; inDays: number | null; urgency: { label: string; tone: string }; monthlyCost?: number | null };
  kind: "renewal" | "trial" | "event" | "idle" | "ended" | "cancelled";
  busy: boolean;
  onAct: (op: string, id?: string, date?: string) => Promise<void>;
}

export function ItemCard({ row, kind, busy, onAct }: ItemCardProps) {
  const item = row.item;
  const [pinning, setPinning] = useState(false);
  const [date, setDate] = useState(item.nextChargeAt ?? item.trialEndsAt ?? item.startsAt ?? "");
  const tone = row.urgency.tone;
  const inDays = row.inDays;

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <span
        className="w-10 h-10 rounded-lg grid place-items-center text-white font-semibold text-[16px] shrink-0"
        style={{ background: item.accent }}
      >
        {item.provider[0]}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14.5px] font-medium">{item.provider}</span>
          {item.amount !== null && (
            <span className="text-[12.5px] text-[var(--ink-soft)]">
              {moneyLabel(item.amount, item.currency)} · {item.cadence}
            </span>
          )}
          {item.category && (
            <span className="text-[11px] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)] px-1.5 py-0.5 rounded-full">{item.category}</span>
          )}
        </div>
        <div className="text-[12.5px] text-[var(--ink-faint)] mt-0.5 truncate">
          {item.fromEmail}
          {item.emailCount > 1 ? ` · ${item.emailCount} emails` : ""}
          {item.where ? ` · ${item.where}` : ""}
        </div>
        {item.hints.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.hints.map((h, i) => (
              <span key={i} className="text-[11.5px] bg-[var(--amber-soft)] text-[var(--amber)] px-2 py-0.5 rounded-full">{h}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        {inDays !== null && (
          <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full tone-${tone}`}>
            {row.urgency.label}
          </span>
        )}
        {inDays !== null && inDays >= 0 && item.kind !== "event" && (
          <span className="text-[12px] text-[var(--ink-faint)] tabular-nums">{formatRefDate(item.kind === "trial" ? item.trialEndsAt : item.nextChargeAt)}</span>
        )}

        {pinning ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded border hairline px-2 py-1 text-[13px] bg-[var(--card)]"
            />
            <button
              disabled={busy}
              onClick={() => { onAct("pin-date", item.id, date); setPinning(false); }}
              className="rounded bg-[var(--accent)] text-white text-[12px] px-2.5 py-1 disabled:opacity-50"
            >
              Save
            </button>
            <button onClick={() => setPinning(false)} className="text-[12px] text-[var(--ink-faint)]">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {kind === "idle" && (
              <button disabled={busy} onClick={() => onAct("keep", item.id)} className="text-[12px] px-2.5 py-1 rounded border hairline hover:bg-[var(--card)] disabled:opacity-50">
                Keep it
              </button>
            )}
            {kind === "cancelled" && (
              <button disabled={busy} onClick={() => onAct("restore", item.id)} className="text-[12px] px-2.5 py-1 rounded border hairline hover:bg-[var(--card)] disabled:opacity-50">
                Restore
              </button>
            )}
            {kind !== "ended" && kind !== "cancelled" && (
              <>
                <button disabled={busy} onClick={() => onAct("cancel", item.id)} className="text-[12px] px-2.5 py-1 rounded border hairline hover:bg-[var(--card)] disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={() => setPinning(true)} className="text-[12px] px-2.5 py-1 rounded border hairline hover:bg-[var(--card)]">
                  Set date
                </button>
              </>
            )}
            <button disabled={busy} onClick={() => { if (confirm(`Drop ${item.provider} from the shelf?`)) onAct("delete", item.id); }} className="text-[12px] px-2.5 py-1 rounded border hairline text-[var(--ink-faint)] hover:text-[var(--red)] disabled:opacity-50">
              Drop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
