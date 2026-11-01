import { NextResponse } from "next/server";
import { exchangeCode, appBaseUrl, REDIRECT_PATH, whoAmI } from "@/lib/google";
import { saveTokens, readRefreshToken, loadShelf, saveShelf, shelfIdFor } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";
import { DEFAULT_SETTINGS } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/app?error=gmail_denied", appBaseUrl(request.headers.get("host"))));
  }
  const verifier = request.headers.get("cookie")?.match(/(?:^|; )perch_pkce=([^;]+)/)?.[1];
  const decodedVerifier = verifier ? decodeURIComponent(verifier) : undefined;
  try {
    const redirectUri = `${appBaseUrl(request.headers.get("host"))}${REDIRECT_PATH}`;
    const tokens = await exchangeCode(code, redirectUri, decodedVerifier);
    const profile = await whoAmI(tokens.access_token);

    // persist tokens on disk, then create or reuse the shelf
    const shelfId = shelfIdFor(profile.email, "google");
    const existing = await loadShelf(shelfId);
    await saveTokens(shelfId, {
      refresh_token: tokens.refresh_token ?? (await readRefreshToken(shelfId)),
      access_token: tokens.access_token,
      expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
    });

    await setSessionCookie({ email: profile.email, provider: "google", shelfId });
    if (!existing) {
      await saveShelf(shelfId, {
        email: profile.email,
        provider: "google",
        settings: { ...DEFAULT_SETTINGS },
        items: [],
        lastSyncedAt: null,
        historyId: null,
        sweeps: [],
      });
    }
    const redirect = NextResponse.redirect(new URL("/app?welcome=1&scan=1", appBaseUrl(request.headers.get("host"))));
    redirect.cookies.set("perch_pkce", "", { path: "/", maxAge: 0 });
    return redirect;
  } catch (err) {
    console.error("google callback failed", err);
    return NextResponse.redirect(new URL("/app?error=google_exchange_failed", appBaseUrl(request.headers.get("host"))));
  }
}
