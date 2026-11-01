"use client";

import { useState } from "react";

export function ConnectScreen({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="micro-label mb-3">Connect your inbox</div>
      <h1 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.025em]">
        Let Perch read the receipts you already have.
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-soft)] max-w-xl">
        Perch only asks Gmail for <span className="font-medium text-[var(--ink)]">gmail.readonly</span>. It never
        sends, deletes, or labels mail. Everything it learns is stored on your disk.
      </p>

      <div className="mt-8 grid gap-4">
        <div className="card p-5">
          <div className="text-[14.5px] font-medium">Connect Gmail</div>
          <p className="mt-1 text-[13.5px] text-[var(--ink-soft)]">
            {configured
              ? "You'll be redirected to Google to grant read-only access to your inbox."
              : "Google OAuth isn't configured yet. The shortest path:"}
          </p>
          {!configured && (
            <ol className="mt-3 space-y-1.5 text-[13px] text-[var(--ink-soft)] list-decimal list-inside">
              <li>Open <a className="underline" href="https://console.cloud.google.com/apis/library/gmail.googleapis.com" target="_blank" rel="noreferrer">Google Cloud → Gmail API</a> → Enable.</li>
              <li>Credentials → Create OAuth client ID (Web application). The client secret is optional — Perch uses PKCE.</li>
              <li>Add this redirect URI: <code className="bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] px-1.5 py-0.5 rounded text-[12px]">http://localhost:3000/api/auth/google/callback</code></li>
              <li>Paste the client ID into <code className="bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] px-1.5 py-0.5 rounded text-[12px]">perch/.env.local</code> as <code className="bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] px-1.5 py-0.5 rounded text-[12px]">GOOGLE_CLIENT_ID=...</code> and restart <code className="bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] px-1.5 py-0.5 rounded text-[12px]">npm run dev</code>.</li>
            </ol>
          )}
          {process.env.NEXT_PUBLIC_HOSTED_URL && typeof window !== "undefined" && window.location.host !== new URL(process.env.NEXT_PUBLIC_HOSTED_URL).host && (
            <p className="mt-3 text-[13px] text-[var(--ink-soft)]">
              Or skip setup entirely: <a className="underline text-[var(--accent)]" href={process.env.NEXT_PUBLIC_HOSTED_URL}>use the hosted Perch</a> — one click, no Google Cloud console.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {configured ? (
              <a href="/api/auth/google/start" className="rounded-full bg-[var(--accent)] text-white text-[14px] font-medium px-5 py-2 hover:opacity-90 transition">
                Continue with Google
              </a>
            ) : (
              <button disabled className="rounded-full bg-[var(--accent)] text-white text-[14px] font-medium px-5 py-2 opacity-50 cursor-not-allowed">
                Configure Google first
              </button>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="text-[14.5px] font-medium">Try with demo data</div>
          <p className="mt-1 text-[13.5px] text-[var(--ink-soft)]">
            See every surface of Perch with a realistic shelf before connecting anything. Nothing is uploaded.
          </p>
          <form method="POST" action="/api/auth/demo" className="mt-4 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@demo.gmail (optional)"
              className="rounded border hairline px-3 py-2 text-[13.5px] bg-[var(--card)] w-60"
            />
            <button type="submit" className="rounded-full border hairline text-[13.5px] font-medium px-4 py-2 hover:bg-[var(--card)] transition">
              Start demo
            </button>
          </form>
        </div>

        <div className="text-[12.5px] text-[var(--ink-faint)]">
          New here?{" "}
          <a href="/" className="underline">Read what Perch watches for</a>
          {" · "}
          <a href="/install" className="underline">Install page</a>
        </div>
      </div>
    </div>
  );
}
