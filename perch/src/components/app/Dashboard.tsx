"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Item, Settings } from "@/lib/types";
import type { Snapshot } from "@/lib/snapshot";
import { moneyLabel } from "@/lib/snapshot";
import { SiteNav } from "@/components/site/SiteNav";
import { ConnectScreen } from "@/components/app/ConnectScreen";
import { StatStrip } from "@/components/app/StatStrip";
import { ItemCard } from "@/components/app/ItemCard";
import { ScanBar } from "@/components/app/ScanBar";
import { SettingsPanel } from "@/components/app/SettingsPanel";

interface StateResponse {
  mode: "none" | "google" | "demo";
  configured?: boolean;
  email?: string;
  snapshot?: Snapshot;
  scan?: { messagesSeen?: number; added?: string[]; updated?: string[]; error?: string } | null;
  settings?: Settings;
}

export function Dashboard() {
  const sp = useSearchParams();
  const [state, setState] = useState<StateResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (scan = false) => {
    const res = await fetch(`/api/perch/state${scan ? "?scan=1" : ""}`, { cache: "no-store" });
    const json = (await res.json()) as StateResponse;
    setState(json);
    if (scan && json.scan?.error) setNotice(`Scan: ${json.scan.error}`);
    else if (scan && (json.scan?.added?.length || json.scan?.updated?.length)) {
      const n = (json.scan.added?.length ?? 0) + (json.scan.updated?.length ?? 0);
      setNotice(`Scan complete — ${json.scan.messagesSeen ?? 0} emails, ${n} change${n === 1 ? "" : "s"}.`);
    }
  }, []);

  useEffect(() => {
    const welcome = sp.get("welcome");
    const error = sp.get("error");
    const scan = sp.get("scan");
    if (welcome) setNotice("Connected. Scanning your inbox now — this takes a few seconds.");
    if (error) setNotice(`Something went wrong: ${error}.`);
    load(scan === "1");
  }, [sp, load]);

  useEffect(() => {
    pollRef.current = setInterval(() => load(false), 120_000);
    function onFocus() { load(false); }
    window.addEventListener("focus", onFocus);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  if (!state) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="mx-auto max-w-5xl px-5 py-16 text-[var(--ink-soft)]">Loading your shelf…</div>
      </div>
    );
  }
  if (state.mode === "none") {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <ConnectScreen configured={Boolean(state.configured)} />
      </div>
    );
  }

  const snap = state.snapshot!;
  const settings = state.settings ?? (snap as Snapshot & { settings?: Settings }).settings;

  async function act(op: string, id?: string, date?: string, newSettings?: Partial<Settings>) {
    setBusy(true);
    try {
      const res = await fetch("/api/perch/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ op, id, date, settings: newSettings }),
      });
      const json = await res.json();
      if (!res.ok) { setNotice(json.error ?? "Action failed."); return; }
      setState((prev) => (prev ? { ...prev, snapshot: json.snapshot } : prev));
      if (json.op === "settings") setNotice("Settings saved.");
    } finally {
      setBusy(false);
    }
  }

  async function scanNow() {
    setBusy(true);
    setNotice(null);
    await load(true);
    setBusy(false);
  }

  async function disconnect() {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/logout";
    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 pt-6 pb-20">
        {notice && (
          <div className="mb-5 rounded-lg border hairline px-4 py-2.5 text-[13.5px] text-[var(--ink-soft)] flex items-center justify-between gap-3">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-[var(--ink-faint)] hover:text-[var(--ink)]">✕</button>
          </div>
        )}

        <ScanBar
          email={state.email!}
          mode={state.mode}
          lastSyncedAt={snap.lastSyncedAt}
          busy={busy}
          onScan={scanNow}
          onDisconnect={disconnect}
        />

        <StatStrip snapshot={snap} />

        {snap.categories.length > 0 && (
          <section className="mt-6">
            <div className="mb-3">
              <h2 className="text-[19px] font-semibold tracking-[-0.01em]">Spend by category</h2>
              <p className="text-[12.5px] text-[var(--ink-faint)]">Monthly-normalised, across active plans</p>
            </div>
            <div className="card p-4 space-y-2.5">
              {(() => {
                const max = Math.max(...snap.categories.map((c) => c.monthly.reduce((s, m) => s + m.amount, 0)), 1);
                return snap.categories.map((c) => {
                  const total = c.monthly.reduce((s, m) => s + m.amount, 0);
                  const cur = c.monthly[0]?.currency ?? "INR";
                  const pct = Math.max(4, Math.round((total / max) * 100));
                  return (
                    <div key={c.name} className="flex items-center gap-3">
                      <div className="w-32 text-[13px] text-[var(--ink-soft)] truncate">{c.name}</div>
                      <div className="flex-1 h-2 rounded-full bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-24 text-right text-[12.5px] text-[var(--ink-soft)] tabular-nums">
                        {moneyLabel(total, cur)}<span className="text-[var(--ink-faint)]"> · {c.count}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-8">
          <Section title="About to renew" subtitle="Active subscriptions, soonest first" tone="accent">
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => setCategoryFilter(null)}
                className={`text-[12px] px-2.5 py-1 rounded-full border hairline ${categoryFilter === null ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "hover:bg-[var(--card)]"}`}
              >
                All
              </button>
              {snap.categories.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCategoryFilter(categoryFilter === c.name ? null : c.name)}
                  className={`text-[12px] px-2.5 py-1 rounded-full border hairline ${categoryFilter === c.name ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "hover:bg-[var(--card)]"}`}
                >
                  {c.name} · {c.count}
                </button>
              ))}
            </div>
            {snap.renewals.filter((r) => !categoryFilter || (r.item.category || "Other") === categoryFilter).length === 0 && <Empty text="No plans in this category." />}
            {snap.renewals.filter((r) => !categoryFilter || (r.item.category || "Other") === categoryFilter).map((r) => (
              <ItemCard key={r.item.id} row={r} kind="renewal" busy={busy} onAct={act} />
            ))}
          </Section>

          {snap.trials.length > 0 && (
            <Section title="Free trials ending" subtitle="Decide before the card does" tone="amber">
              {snap.trials.map((t) => (
                <ItemCard key={t.item.id} row={t} kind="trial" busy={busy} onAct={act} />
              ))}
            </Section>
          )}

          {snap.events.length > 0 && (
            <Section title="Events coming up" subtitle="Tickets, bookings and registrations" tone="accent">
              {snap.events.map((e) => (
                <ItemCard key={e.item.id} row={e} kind="event" busy={busy} onAct={act} />
              ))}
            </Section>
          )}

          {snap.idle.length > 0 && (
            <Section title="Maybe unused" subtitle="Paid plans whose last email is long ago" tone="pending">
              <p className="text-[13.5px] text-[var(--ink-soft)] mb-3">
                These are subscriptions you're still paying for but that haven't sent you anything in a while. Keep them or cancel them in their billing portal.
              </p>
              {snap.idle.map((x) => (
                <ItemCard key={x.item.id} row={{ item: x.item, inDays: null, urgency: { label: "quiet", tone: "pending" }, monthlyCost: x.monthlyCost }} kind="idle" busy={busy} onAct={act} />
              ))}
            </Section>
          )}

          {snap.cancelled.length > 0 && (
            <Section title="Cancelled, waiting to drop" subtitle="Perch will remove these after the configured window" tone="pending">
              {snap.cancelled.map((c) => (
                <ItemCard key={c.id} row={{ item: c, inDays: null, urgency: { label: "cancelled", tone: "pending" }, monthlyCost: null }} kind="cancelled" busy={busy} onAct={act} />
              ))}
            </Section>
          )}

          {snap.ended.length > 0 && (
            <Section title="Ended & archived" subtitle="Trials lapsed, events passed, things over" tone="pending">
              {snap.ended.map((e) => (
                <ItemCard key={e.id} row={{ item: e, inDays: null, urgency: { label: "ended", tone: "pending" }, monthlyCost: null }} kind="ended" busy={busy} onAct={act} />
              ))}
            </Section>
          )}

          <SettingsPanel settings={settings ?? state.settings} onSave={(s) => act("settings", undefined, undefined, s)} busy={busy} />
        </div>
      </main>
    </div>
  );
}

function Section({ title, subtitle, tone, children }: { title: string; subtitle: string; tone: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-[19px] font-semibold tracking-[-0.01em]">{title}</h2>
        <p className="text-[12.5px] text-[var(--ink-faint)]">{subtitle}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="card p-5 text-[14px] text-[var(--ink-soft)]">{text}</div>;
}
