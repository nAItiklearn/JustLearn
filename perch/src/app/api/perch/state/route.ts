import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { loadShelf, saveShelf, sweep, normalizeSettings, readFreshAccessToken } from "@/lib/store";
import { buildSnapshot } from "@/lib/snapshot";
import { runScan, emptyScanReport } from "@/lib/gmail";
import type { ScanReport } from "@/lib/gmail";

/**
 * GET /api/perch/state?scan=1
 * Returns the dashboard snapshot. With `scan=1` a Gmail (or demo) scan runs
 * first, then the auto-clean sweep, then the snapshot is computed.
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ mode: "none" as const, configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
  }
  const shelf = await loadShelf(session.shelfId);
  if (!shelf) {
    return NextResponse.json({ mode: "none" as const, configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) });
  }
  shelf.settings = normalizeSettings(shelf.settings);

  const wantScan = new URL(request.url).searchParams.get("scan") === "1";
  let report: ScanReport | null = null;

  if (wantScan) {
    if (session.provider === "google") {
      const accessToken = await readFreshAccessToken(session.shelfId);
      if (accessToken) {
        report = await runScan(shelf, accessToken);
        if (!report.error) {
          shelf.lastSyncedAt = report.ranAt || new Date().toISOString();
        }
      } else {
        report = emptyScanReport();
        report.error = "gmail_reconnect_needed";
        report.ranAt = new Date().toISOString();
      }
    } else {
      report = simulateDemoScan(shelf);
    }
  }

  // auto-clean pass on every load
  const result = sweep(shelf);
  if (result.ended.length || result.dropped.length || report?.added.length || report?.updated.length) {
    shelf.items = result.items;
    const sweepEntry = {
      at: new Date().toISOString(),
      added: report?.added ?? [],
      updated: report?.updated ?? [],
      ended: result.ended,
      dropped: result.dropped,
    };
    shelf.sweeps = [sweepEntry, ...(shelf.sweeps ?? [])].slice(0, 8);
    shelf.lastSyncedAt = wantScan ? sweepEntry.at : shelf.lastSyncedAt;
    await saveShelf(session.shelfId, shelf);
  } else if (wantScan) {
    shelf.lastSyncedAt = new Date().toISOString();
    await saveShelf(session.shelfId, shelf);
  }

  const snapshot = buildSnapshot({ items: shelf.items, settings: shelf.settings, lastSyncedAt: shelf.lastSyncedAt, sweeps: shelf.sweeps ?? [] });
  return NextResponse.json({
    mode: session.provider,
    email: shelf.email,
    snapshot,
    scan: report,
    settings: shelf.settings,
  });
}

/** Demo shelves "scan" by advancing synthetic email counters — a fair stand-in for real traffic. */
function simulateDemoScan(shelf: { items: { emailCount: number; lastSeenAt: string }[] }): ScanReport {
  const at = new Date().toISOString();
  for (const item of shelf.items) {
    item.emailCount += Math.random() < 0.15 ? 1 : 0;
    if (Math.random() < 0.08) item.lastSeenAt = at;
  }
  const report = emptyScanReport();
  report.ranAt = at;
  report.messagesSeen = Math.floor(6 + Math.random() * 14);
  return report;
}
