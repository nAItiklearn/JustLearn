import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { loadShelf, saveShelf, sweep } from "@/lib/store";
import { buildSnapshot } from "@/lib/snapshot";
import type { Item, Settings } from "@/lib/types";
import { moneyLabel } from "@/lib/snapshot";

type Op = "cancel" | "keep" | "pin-date" | "delete" | "restore" | "settings" | "hint-dismiss";

/**
 * POST /api/perch/action
 * body: { op, id?, date?, settings? }
 * Every op persists, then returns a fresh snapshot so the UI stays in sync.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });
  const shelf = await loadShelf(session.shelfId);
  if (!shelf) return NextResponse.json({ error: "no_shelf" }, { status: 404 });

  const body = await request.json().catch(() => null) as { op?: Op; id?: string; date?: string; settings?: Partial<Settings> } | null;
  if (!body?.op) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const itemIdx = body.id ? shelf.items.findIndex((i) => i.id === body.id) : -1;
  const item = itemIdx >= 0 ? shelf.items[itemIdx] : null;

  switch (body.op) {
    case "cancel": {
      if (!item) return NextResponse.json({ error: "no_item" }, { status: 404 });
      item.status = "cancelled";
      item.cancelledAt = new Date().toISOString();
      item.hints = uniqueHints(item, ["Marked cancelled by you — Perch will stop counting it and drop it from the shelf before long."]);
      break;
    }
    case "keep": {
      // "yes I know, keep it" → dismiss idle hints for 60 days
      if (!item) return NextResponse.json({ error: "no_item" }, { status: 404 });
      item.hints = item.hints.filter((h) => !h.startsWith("NO EMAILS SEEN FOR"));
      item.snoozeUntil = new Date(Date.now() + 60 * 864e5).toISOString();
      break;
    }
    case "pin-date": {
      if (!item) return NextResponse.json({ error: "no_item" }, { status: 404 });
      const d = body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
      if (!d) return NextResponse.json({ error: "bad_date" }, { status: 400 });
      if (item.kind === "event") item.startsAt = d;
      else if (item.kind === "trial") item.trialEndsAt = d;
      else {
        item.nextChargeAt = d;
        item.pinned = true;
      }
      item.hints = uniqueHints(item, ["Renewal date set by you."]);
      break;
    }
    case "restore": {
      if (!item) return NextResponse.json({ error: "no_item" }, { status: 404 });
      item.status = "active";
      item.cancelledAt = null;
      item.hints = item.hints.filter((h) => !h.startsWith("Marked cancelled"));
      break;
    }
    case "delete": {
      if (itemIdx < 0) return NextResponse.json({ error: "no_item" }, { status: 404 });
      shelf.items.splice(itemIdx, 1);
      break;
    }
    case "settings": {
      shelf.settings = { ...shelf.settings, ...(body.settings ?? {}) };
      const limits: Record<string, number> = { graceDays: 30, cleanupDays: 365, idleDays: 730, cancelledDropDays: 365 };
      for (const key of Object.keys(limits)) {
        const v = shelf.settings[key as keyof Settings];
        if (typeof v !== "number" || v < 0 || v > limits[key]) {
          return NextResponse.json({ error: `invalid_${key}` }, { status: 400 });
        }
      }
      break;
    }
    default:
      return NextResponse.json({ error: "unknown_op" }, { status: 400 });
  }

  await saveShelf(session.shelfId, shelf);
  const cleaned = sweep(shelf);
  shelf.items = cleaned.items;
  await saveShelf(session.shelfId, shelf);
  const snapshot = buildSnapshot({ items: shelf.items, settings: shelf.settings, lastSyncedAt: shelf.lastSyncedAt, sweeps: shelf.sweeps ?? [] });
  const moneyLine = snapshot.stats.monthlySpend.map((m) => moneyLabel(m.amount, m.currency)).join(" + ");
  return NextResponse.json({ ok: true, snapshot, title: item?.provider, op: body.op, moneyLine });
}

function uniqueHints(item: Item, additions: string[]): string[] {
  return Array.from(new Set([...(item.hints ?? []), ...additions]));
}
