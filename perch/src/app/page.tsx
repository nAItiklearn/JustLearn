import Link from "next/link";
import { SiteNav, PerthMark } from "@/components/site/SiteNav";
import { DemoShelf } from "@/components/site/DemoShelf";
import { RenewalLive } from "@/components/site/RenewalLive";
import { TrialCountdown } from "@/components/site/TrialCountdown";
import { IdleHighlight } from "@/components/site/IdleHighlight";
import { ArchiveTimeline } from "@/components/site/ArchiveTimeline";

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 pt-14 pb-20">
        {/* Hero */}
        <section className="grid md:grid-cols-[1.1fr_1fr] gap-10 items-center">
          <div>
            <div className="micro-label mb-4">Perch · v0.1 · Gmail-only, read-only</div>
            <h1 className="text-[44px] sm:text-[56px] leading-[1.02] font-semibold tracking-[-0.025em]">
              Everything your inbox charges you for,<br />
              <span className="text-[var(--accent)]">on one perch.</span>
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-[var(--ink-soft)] max-w-xl">
              Perch connects to Gmail, reads the receipts you already have, and keeps a live shelf of every
              subscription, free trial, renewal date and event. Things that are over get archived. Things you
              forgot you bought get found.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/app" className="rounded-full bg-[var(--accent)] text-white text-[14.5px] font-medium px-5 py-2.5 hover:opacity-90 transition">
                Open Perch
              </Link>
              <a href="#demo" className="rounded-full border hairline text-[14.5px] font-medium px-5 py-2.5 hover:bg-[var(--card)] transition">
                Try the live demo
              </a>
            </div>
            <ul className="mt-6 text-[13.5px] text-[var(--ink-soft)] space-y-1.5">
              <li>· Read-only Gmail access. Nothing is sent to Perch.</li>
              <li>· No account, no telemetry, no third-party fonts.</li>
              <li>· Local-first: your shelf lives on your disk, under your name.</li>
            </ul>
          </div>
          <div id="demo" className="perch-in">
            <DemoShelf />
          </div>
        </section>

        {/* Watch */}
        <section id="watch" className="mt-28">
          <div className="micro-label mb-3">What Perch watches for</div>
          <h2 className="text-[30px] sm:text-[38px] font-semibold tracking-[-0.02em] max-w-2xl">
            Three kinds of things, one shelf.
          </h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <WatchCard title="Renewals" tone="this-month" body="Every receipt that repeats — Netflix, Figma, your cloud host, the thing you bought at 2am. Sorted by the next charge date, with days-left chips coloured by urgency." />
            <WatchCard title="Free trials" tone="soon" body="Trials Perch can see ending in 3, 7, 14 days — so you decide before the card does. One click to keep, one click to cancel in your own billing portal." />
            <WatchCard title="Events" tone="later" body="Tickets, registrations, bookings and itineraries. What's coming up, what already passed (and gets archived), where it's happening." />
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <WatchCard title="Maybe unused" tone="pending" body="Paid subscriptions whose last supporting email is older than you configured (120 days by default). The ones you keep paying for but never open." />
            <WatchCard title="Ended & archived" tone="pending" body="Trials that lapsed, events that happened, cancellations you confirmed. Kept for 45 days so you can undo, then dropped from the shelf entirely." />
          </div>
        </section>

        {/* Live, not stale */}
        <section className="mt-28">
          <div className="micro-label mb-3">Live, not stale</div>
          <h2 className="text-[30px] sm:text-[38px] font-semibold tracking-[-0.02em] max-w-2xl">
            It rescans on open, on focus, and on a timer.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-soft)] max-w-2xl">
            New receipt in your inbox? Perch picks it up the next time it scans. Every scan is incremental — it only
            asks Gmail for messages newer than the last one it saw, so it is fast and polite. Items that have run
            their course move to "ended" on their own, and old ended items are dropped from the shelf so it never
            grows forever.
          </p>
        </section>

        {/* As it happens */}
        <section className="mt-28">
          <div className="micro-label mb-3">As it happens</div>
          <h2 className="text-[30px] sm:text-[38px] font-semibold tracking-[-0.02em] max-w-2xl">
            Four moments, shown as they occur.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-soft)] max-w-2xl">
            The widgets below are simulations running in your browser. They mirror what Perch shows on a real shelf,
            on a real scan.
          </p>
        </section>

        {/* 1. Renewal */}
        <section className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.01em]">A renewal, the moment it lands.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              When a new receipt arrives, Perch adds the item on the next scan and colours the urgency chip by
              days-left. The chip goes from "pending" (no date yet) to "in N days" once it has a date. Nothing is
              guessed before the email says so.
            </p>
          </div>
          <div className="perch-in"><RenewalLive /></div>
        </section>

        {/* 2. Trial */}
        <section className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="md:order-2">
            <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.01em]">Trials that ring before the card does.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              Free trials are sorted by end date. At 1 day or fewer the chip turns red and says "decide now" —
              cancel in your billing portal before the charge, or keep it. At 0 days it moves to ended on its own.
            </p>
          </div>
          <div className="md:order-1 perch-in"><TrialCountdown /></div>
        </section>

        {/* 3. Idle */}
        <section className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.01em]">Maybe unused, surfaced honestly.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              A paid plan whose last supporting email is older than your threshold (120 days by default) gets an
              amber "maybe unused" hint. It is a hint, not a verdict — you keep or drop it. The threshold is yours
              to change.
            </p>
          </div>
          <div className="perch-in"><IdleHighlight /></div>
        </section>

        {/* 4. Archive */}
        <section className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="md:order-2">
            <h3 className="text-[22px] sm:text-[26px] font-semibold tracking-[-0.01em]">Ended things leave on their own.</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">
              Trials that lapse and events that pass move to "ended" after a 3-day grace window, stay 45 days so
              you can undo, then are dropped from the shelf. The shelf does not grow forever.
            </p>
          </div>
          <div className="md:order-1 perch-in"><ArchiveTimeline /></div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="mt-28">
          <div className="micro-label mb-3">Privacy</div>
          <h2 className="text-[30px] sm:text-[38px] font-semibold tracking-[-0.02em] max-w-2xl">
            Zero telemetry. Not a promise, a ledger.
          </h2>
          <div className="mt-6 card divide-y" style={{ borderColor: "var(--line)" }}>
            <LedgerRow label="Gmail scope" value="gmail.readonly — nothing broader" />
            <LedgerRow label="What is read" value="Receipts, renewals, trials, events. Never your personal mail beyond the search queries below." />
            <LedgerRow label="What is stored" value="Parsed subscription facts (provider, amount, cadence, dates), your settings, and Google refresh token — on your disk." />
            <LedgerRow label="What is sent" value="Nothing. No analytics, no crash reports, no accounts, no third-party requests on this page." />
            <LedgerRow label="What is searched" value="Targeted queries for receipts, renewals, subscriptions, trials and tickets — never your full inbox." />
            <LedgerRow label="Undo" value="One click to delete any item, or the whole shelf. Disconnecting Gmail also deletes the stored token." />
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-28">
          <div className="micro-label mb-3">Questions, answered.</div>
          <h2 className="text-[30px] sm:text-[38px] font-semibold tracking-[-0.02em] max-w-2xl">
            FAQ
          </h2>
          <div className="mt-6 space-y-2">
            <Faq q="Do I need to pay?" a="No. Free and open source, no paid tier, no trial clock." />
            <Faq q="Is it really read-only?" a="Yes. OAuth scope is gmail.readonly. Perch reads metadata and snippets; it cannot send, delete, or label mail." />
            <Faq q="How often does it scan?" a="On open, on window focus, and every few minutes while open. Each scan is incremental — only messages newer than the last one seen." />
            <Faq q="What counts as a subscription?" a="Anything with a recurring charge or renewal date Perch can parse from a receipt: SaaS, hosting, media, memberships, tickets. One-off purchases are ignored." />
            <Faq q="What if my receipt is in another language?" a="Date and money extractors target English receipts. Other languages may be missed — send an example and we'll extend them." />
            <Faq q="How do I install it?" a="It's a web app. Open in any browser; the install page covers home-screen and dock." />
            <Faq q="Where does my data live?" a="On your disk, in .perch-data next to the app. Nothing uploaded." />
            <Faq q="Can I try it without Gmail?" a="Yes — demo mode builds a realistic shelf so you can see every surface first." />
          </div>
        </section>

        {/* CTA */}
        <section className="mt-28 text-center">
          <h2 className="text-[34px] sm:text-[44px] font-semibold tracking-[-0.025em]">
            Stop paying for things you forgot.
          </h2>
          <p className="mt-3 text-[var(--ink-soft)]">Open Perch, connect Gmail, and see what your inbox has been charging you for.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/app" className="rounded-full bg-[var(--accent)] text-white text-[14.5px] font-medium px-5 py-2.5 hover:opacity-90 transition">
              Open Perch
            </Link>
            <Link href="/install" className="rounded-full border hairline text-[14.5px] font-medium px-5 py-2.5 hover:bg-[var(--card)] transition">
              Install page
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t hairline">
        <div className="mx-auto max-w-5xl px-5 py-6 flex items-center justify-center gap-2 text-[12.5px] text-[var(--ink-faint)]">
          <PerthMark size={14} /> Perch · free, open source, read-only · © 2026
        </div>
      </footer>
    </>
  );
}

function WatchCard({ title, tone, body }: { title: string; tone: string; body: string }) {
  return (
    <div className="card p-5">
      <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full tone-${tone}`}>{title}</span>
      <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid sm:grid-cols-[160px_1fr] gap-2 px-5 py-4">
      <div className="micro-label pt-0.5">{label}</div>
      <div className="text-[14.5px] text-[var(--ink-soft)]">{value}</div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="card px-5 py-4">
      <summary className="flex items-center justify-between gap-4 text-[15px] font-medium">
        <span>{q}</span>
        <span className="text-[var(--ink-faint)]">+</span>
      </summary>
      <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--ink-soft)]">{a}</p>
    </details>
  );
}
