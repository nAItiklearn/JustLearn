"use client";

import { useEffect, useState } from "react";
import { SiteNav } from "@/components/site/SiteNav";

export default function InstallPage() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() { setInstalled(true); setDeferred(null); }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <div className="micro-label mb-3">Install Perch</div>
        <h1 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.025em]">
          Put Perch where you'll see it.
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-soft)]">
          Perch is a web app. You can use it in any browser, or install it so it behaves like a native app —
          its own window, its own icon in the dock or taskbar, and offline-friendly caching of the shell.
        </p>

        <div className="mt-8 card p-5">
          <div className="text-[14.5px] font-medium">Install from this browser</div>
          {installed ? (
            <p className="mt-2 text-[13.5px] text-[var(--accent)]">Perch is installed. You can open it from your home screen or dock.</p>
          ) : deferred ? (
            <>
              <p className="mt-2 text-[13.5px] text-[var(--ink-soft)]">Your browser supports one-click install.</p>
              <button onClick={install} className="mt-3 rounded-full bg-[var(--accent)] text-white text-[14px] font-medium px-5 py-2 hover:opacity-90 transition">
                Install Perch
              </button>
            </>
          ) : (
            <p className="mt-2 text-[13.5px] text-[var(--ink-soft)]">
              One-click install isn't available here (Chrome/Edge on desktop or Android show it automatically).
              Use the manual steps below.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4">
          <Step title="Chrome / Edge (desktop)" body="Open Perch in Chrome or Edge → click the install icon in the address bar (or ⋯ → Install Perch) → confirm. Perch opens in its own window." />
          <Step title="Safari (Mac)" body="Open Perch in Safari → File → Add to Dock. It appears as a normal Mac app with its own icon." />
          <Step title="Safari (iPhone / iPad)" body="Open Perch in Safari → Share → Add to Home Screen. It launches full-screen from the home screen." />
          <Step title="Android (Chrome)" body="Open Perch → ⋮ → Install app (or 'Add to Home screen'). It behaves like a native app." />
        </div>

        <div className="mt-8 card p-5">
          <div className="text-[14.5px] font-medium">Run it yourself</div>
          <p className="mt-1 text-[13.5px] text-[var(--ink-soft)]">
            Perch is open source. Clone the repo, add your own Google OAuth client, and run it locally or on
            Vercel. The data stays on the machine that runs it.
          </p>
          <pre className="mt-3 rounded bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] p-3 text-[12.5px] overflow-x-auto">{`git clone https://github.com/nAItiklearn/perch.git
cd perch
npm install
cp .env.example .env.local
npm run dev`}</pre>
        </div>

        <div className="mt-10 text-[12.5px] text-[var(--ink-faint)]">
          Perch doesn't ship a desktop installer yet — the browser install covers every platform above.
          If you want a native window app, the source is a Next.js project you can wrap with Tauri yourself.
        </div>
      </main>
    </>
  );
}

function Step({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-4">
      <div className="text-[14px] font-medium">{title}</div>
      <p className="mt-1.5 text-[13.5px] text-[var(--ink-soft)] leading-relaxed">{body}</p>
    </div>
  );
}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }
}