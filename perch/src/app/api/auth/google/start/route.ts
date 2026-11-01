import { NextResponse } from "next/server";
import { authorizeUrl, appBaseUrl, configured, REDIRECT_PATH } from "@/lib/google";
import crypto from "crypto";

export async function GET(request: Request) {
  if (!configured()) {
    return NextResponse.redirect(new URL("/app?error=not_configured", appBaseUrl(request.headers.get("host"))));
  }
  const redirectUri = `${appBaseUrl(request.headers.get("host"))}${REDIRECT_PATH}`;
  const state = crypto.randomBytes(12).toString("hex");
  // PKCE (S256) — lets the flow work without a client secret
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const res = NextResponse.redirect(authorizeUrl(redirectUri, state, challenge));
  res.cookies.set("perch_pkce", verifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
