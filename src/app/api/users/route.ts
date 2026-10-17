import { NextResponse } from "next/server";
import { getServerUsernames, saveServerUsernames } from "@/lib/server-store";

// GET: check or list usernames
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkName = searchParams.get("check");

  const usernames = await getServerUsernames();

  if (checkName) {
    const normalized = checkName.trim().replace(/^@/, "").toLowerCase();
    const isTaken = usernames.some((u) => u.toLowerCase() === normalized);
    return NextResponse.json({
      username: normalized,
      isAvailable: !isTaken,
      message: isTaken ? `@${checkName} is already taken.` : `@${checkName} is available!`,
    });
  }

  return NextResponse.json({ usernames });
}

// POST: register a new unique username
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawName = body?.username || "";
    const clean = String(rawName).trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);

    if (clean.length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    const normalized = clean.toLowerCase();
    const existing = await getServerUsernames();

    // Check if already taken
    const isTaken = existing.some((u) => u.toLowerCase() === normalized);
    if (isTaken) {
      return NextResponse.json(
        {
          success: false,
          error: `@${clean} is already taken. Please choose a unique name.`,
        },
        { status: 409 }
      );
    }

    // Add and save
    const updated = [...existing, clean];
    await saveServerUsernames(updated);

    return NextResponse.json({
      success: true,
      username: clean,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
