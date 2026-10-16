import { NextResponse } from "next/server";

const CLOUD_USERS_ID = "ff808181a09d98f701a14624fa0075c3";
const DB_BASE = "https://api.restful-api.dev/objects/";

async function getRegisteredUsernames(): Promise<string[]> {
  try {
    const res = await fetch(`${DB_BASE}${CLOUD_USERS_ID}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.usernames && Array.isArray(json.data.usernames)) {
        return json.data.usernames;
      }
    }
  } catch (err) {
    console.error("Failed to fetch cloud usernames:", err);
  }
  // Fallback defaults
  return ["feynman_fellow", "turing_nomad"];
}

async function saveRegisteredUsernames(usernames: string[]): Promise<boolean> {
  try {
    const res = await fetch(`${DB_BASE}${CLOUD_USERS_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "justlearn_users_registry_v1",
        data: { usernames },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to save cloud usernames:", err);
    return false;
  }
}

// GET: check or list usernames
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkName = searchParams.get("check");

  const usernames = await getRegisteredUsernames();

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
    const existing = await getRegisteredUsernames();

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
    await saveRegisteredUsernames(updated);

    return NextResponse.json({
      success: true,
      username: clean,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
