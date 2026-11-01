import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/session";
import { deleteShelf } from "@/lib/store";

export async function POST(request: Request) {
  const session = await getSession();
  if (session && session.provider === "demo") {
    await deleteShelf(session.shelfId);
  }
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/app", new URL(request.url).origin), { status: 303 });
}
