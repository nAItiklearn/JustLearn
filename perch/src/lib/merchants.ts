// ── Known merchant catalog ─────────────────────────────────────────────
// Used to give clean names, brand accents and useful hints when scanning
// Gmail. Anything unknown falls back to a domain-derived name + hashed hue.

export interface Merchant {
  key: string;
  name: string;
  color: string;
  /** typical billing cadence when known */
  cadence?: "monthly" | "yearly";
  domains: string[];
  /** Perch category for spend breakdown. */
  category?: string;
}

export const CATEGORIES = ["Entertainment", "Productivity", "Cloud & Storage", "Food & Delivery", "Shopping", "Gaming", "News & Reading", "Events", "Other"] as const;

const CATEGORY_BY_KEY: Record<string, string> = {
  netflix: "Entertainment", spotify: "Entertainment", "youtube-premium": "Entertainment",
  "prime-video": "Entertainment", hotstar: "Entertainment", crunchyroll: "Entertainment",
  patreon: "Entertainment", eventbrite: "Entertainment",
  figma: "Productivity", notion: "Productivity", github: "Productivity", vercel: "Productivity",
  "microsoft-365": "Productivity", dropbox: "Productivity", zoom: "Productivity",
  canva: "Productivity", grammarly: "Productivity", coursera: "Productivity",
  linkedin: "Productivity", duolingo: "Productivity", openai: "Productivity",
  claude: "Productivity", adobe: "Productivity",
  "google-one": "Cloud & Storage", "google-storage": "Cloud & Storage", icloud: "Cloud & Storage",
  "apple-music": "Entertainment", amazon: "Shopping", "x-premium": "News & Reading",
  "discord-nitro": "Entertainment", zomato: "Food & Delivery", swiggy: "Food & Delivery",
  ubisoft: "Gaming", xbox: "Gaming", "real-debrid": "Entertainment", uber: "Food & Delivery",
};

export function categoryFor(key: string): string {
  return CATEGORY_BY_KEY[key] ?? "Other";
}

export const MERCHANTS: Merchant[] = [
  { key: "netflix", name: "Netflix", color: "#b1060f", cadence: "monthly", domains: ["netflix.com"] },
  { key: "spotify", name: "Spotify", color: "#1db954", cadence: "monthly", domains: ["spotify.com"] },
  { key: "youtube-premium", name: "YouTube Premium", color: "#cc0000", cadence: "monthly", domains: ["youtube.com"] },
  { key: "google-one", name: "Google One", color: "#4285f4", cadence: "monthly", domains: ["sandersgateway.google.com", "one.google.com"] },
  { key: "google-storage", name: "Google Photos / Drive", color: "#34a853", cadence: "monthly", domains: ["accounts.google.com"] },
  { key: "icloud", name: "iCloud+", color: "#5a9ced", cadence: "monthly", domains: ["icloud.com", "apple.com"] },
  { key: "apple-music", name: "Apple Music", color: "#fa2b56", cadence: "monthly", domains: ["music.apple.com"] },
  { key: "prime-video", name: "Prime Video", color: "#00a8e1", cadence: "monthly", domains: ["primevideo.com"] },
  { key: "amazon", name: "Amazon", color: "#ff9900", cadence: "yearly", domains: ["amazon.in", "amazon.com"] },
  { key: "hotstar", name: "JioHotstar", color: "#1f80e0", cadence: "yearly", domains: ["hotstar.com", "jiocinema.com"] },
  { key: "crunchyroll", name: "Crunchyroll", color: "#f47521", cadence: "monthly", domains: ["crunchyroll.com"] },
  { key: "figma", name: "Figma", color: "#a259ff", cadence: "monthly", domains: ["figma.com"] },
  { key: "notion", name: "Notion", color: "#111111", cadence: "monthly", domains: ["makenotion.com", "notion.so"] },
  { key: "github", name: "GitHub", color: "#181717", cadence: "yearly", domains: ["github.com"] },
  { key: "vercel", name: "Vercel", color: "#000000", cadence: "monthly", domains: ["vercel.com"] },
  { key: "openai", name: "ChatGPT / OpenAI", color: "#10a37f", cadence: "monthly", domains: ["openai.com", "stripe.com"] },
  { key: "claude", name: "Claude", color: "#d97757", cadence: "monthly", domains: ["anthropic.com"] },
  { key: "adobe", name: "Adobe", color: "#ff0000", cadence: "monthly", domains: ["adobe.com"] },
  { key: "canva", name: "Canva", color: "#00c4cc", cadence: "yearly", domains: ["canva.com"] },
  { key: "microsoft-365", name: "Microsoft 365", color: "#0078d4", cadence: "monthly", domains: ["microsoft.com", "account.microsoft.com"] },
  { key: "dropbox", name: "Dropbox", color: "#0061ff", cadence: "monthly", domains: ["dropbox.com"] },
  { key: "zoom", name: "Zoom", color: "#2d8cff", cadence: "yearly", domains: ["zoom.us"] },
  { key: "x-premium", name: "X Premium", color: "#536471", cadence: "monthly", domains: ["x.com", "twitter.com"] },
  { key: "discord-nitro", name: "Discord Nitro", color: "#5865f2", cadence: "monthly", domains: ["discord.com"] },
  { key: "patreon", name: "Patreon", color: "#ff424d", cadence: "monthly", domains: ["patreon.com"] },
  { key: "duolingo", name: "Duolingo Super", color: "#58cc02", cadence: "monthly", domains: ["duolingo.com"] },
  { key: "grammarly", name: "Grammarly", color: "#15c39a", cadence: "monthly", domains: ["grammarly.com"] },
  { key: "coursera", name: "Coursera Plus", color: "#0056d2", cadence: "monthly", domains: ["coursera.org"] },
  { key: "zomato", name: "Zomato Gold", color: "#e23744", cadence: "yearly", domains: ["zomato.com"] },
  { key: "swiggy", name: "Swiggy One", color: "#fc8019", cadence: "monthly", domains: ["swiggy.com"] },
  { key: "ubisoft", name: "Ubisoft+", color: "#0099ff", cadence: "monthly", domains: ["ubisoft.com"] },
  { key: "xbox", name: "Xbox Game Pass", color: "#107c10", cadence: "monthly", domains: ["xbox.com"] },
  { key: "real-debrid", name: "Real-Debrid", color: "#f03", cadence: "monthly", domains: ["real-debrid.com"] },
  { key: "linkedin", name: "LinkedIn Premium", color: "#0a66c2", cadence: "monthly", domains: ["linkedin.com"] },
  { key: "eventbrite", name: "Eventbrite", color: "#f05537", domains: ["eventbrite.com", "order.eventbrite.com"] },
  { key: "uber", name: "Uber", color: "#000000", cadence: "monthly", domains: ["uber.com"] },
];

const DOMAIN = /^[^@\s]+@([a-z0-9.\-]+)$/i;

export function merchantFrom(email: string, subject: string, body: string): { merchant: Merchant | null; name: string; key: string; color: string } {
  const domainMatch = email.match(DOMAIN);
  if (domainMatch) {
    const domain = domainMatch[1].toLowerCase();
    const found = MERCHANTS.find((m) => m.domains.some((d) => domain === d || domain.endsWith("." + d)));
    if (found) return { merchant: found, name: found.name, key: found.key, color: found.color };
  }
  return {
    merchant: null,
    name: nameFromDomain(domainMatch?.[1] ?? email),
    key: slug(domainMatch?.[1] ?? "unknown"),
    color: hue(domainMatch?.[1] ?? email),
  };
}

export function merchantByKey(key: string): Merchant | null {
  return MERCHANTS.find((m) => m.key === key) ?? null;
}

function nameFromDomain(domain: string): string {
  if (!domain) return "Unknown sender";
  const base = domain.replace(/^(mail|noreply|no-reply|email|notify|notification|account|billing|msg)\./, "");
  const root = base.split(".").slice(-3).find((p) => !["com", "in", "co", "org", "net", "us", "io"].includes(p)) ?? base;
  return root.charAt(0).toUpperCase() + root.slice(1).split(/[-]/)[0];
}

function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "unknown";
}

function hue(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return `hsl(${h} 62% 42%)`;
}
