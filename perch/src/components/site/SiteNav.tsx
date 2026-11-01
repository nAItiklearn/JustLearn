import Link from "next/link";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const links = [
  { href: "/#watch", label: "What it watches" },
  { href: "/#demo", label: "Demo" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/install", label: "Install" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[color-mix(in_srgb,var(--paper)_86%,transparent)] border-b hairline">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-5 h-14">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <PerthMark /> Perch
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-[13.5px] text-[var(--ink-soft)]">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[var(--ink)] transition">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle compact />
          <Link href="/app" className="rounded-full bg-[var(--accent)] text-white text-[13.5px] font-medium px-4 py-1.5 hover:opacity-90 transition">
            Open Perch
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PerthMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* a small perch: a branch with a resting dot */}
      <path d="M3 16.5h13M7 16.5V9.5a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="14" cy="9.5" r="2.6" fill="currentColor" />
      <path d="M16.7 10.9l1.7 2.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
