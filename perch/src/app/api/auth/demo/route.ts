import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { shelfIdFor, saveShelf } from "@/lib/store";
import { buildDemoShelf } from "@/lib/demo";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const ct = request.headers.get("content-type") ?? "";
  let email = "demo";
  if (ct.includes("application/json")) {
    const body = await request.json().catch(() => ({} as { email?: string }));
    email = (body?.email ?? "demo").toString().slice(0, 120);
  } else {
    const fd = await request.formData().catch(() => null);
    const v = fd?.get("email");
    if (typeof v === "string" && v.trim()) email = v.trim().slice(0, 120);
  }
  const shelfId = shelfIdFor(email, "demo");
  await saveShelf(shelfId, buildDemoShelf(email));
  await setSessionCookie({ email, provider: "demo", shelfId });
  return NextResponse.redirect(new URL("/app?welcome=1", origin || "http://localhost:3000"));
}
