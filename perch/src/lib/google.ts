// ── Google OAuth 2.0 (code flow) + tiny Gmail REST client ─────────────
// Read-only: scope gmail.metadata? No — gmail.readonly, nothing broader.

export const REDIRECT_PATH = "/api/auth/google/callback";

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export const SCOPE = GMAIL_SCOPE + " openid email";

export interface Tokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export function configured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID);
}

export function appBaseUrl(headerHost: string | null): string {
  if (process.env.MAIN_APP_URL) return process.env.MAIN_APP_URL.replace(/\/$/, "");
  const host = headerHost ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}`;
}

export function authorizeUrl(redirectUri: string, state: string, codeChallenge?: string): string {
  const params: Record<string, string> = {
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  };
  if (codeChallenge) {
    params.code_challenge = codeChallenge;
    params.code_challenge_method = "S256";
  }
  return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(params).toString()}`;
}

export async function exchangeCode(code: string, redirectUri: string, codeVerifier?: string): Promise<Tokens> {
  const body: Record<string, string> = {
    client_id: process.env.GOOGLE_CLIENT_ID!,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  };
  if (process.env.GOOGLE_CLIENT_SECRET) body.client_secret = process.env.GOOGLE_CLIENT_SECRET;
  if (codeVerifier) body.code_verifier = codeVerifier;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });
  if (!res.ok) throw new Error(`token exchange failed: ${await res.text()}`);
  return (await res.json()) as Tokens;
}

export async function refreshAccessToken(refreshToken: string): Promise<Tokens> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`token refresh failed: ${await res.text()}`);
  return (await res.json()) as Tokens;
}

export async function whoAmI(accessToken: string): Promise<{ email: string }> {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`profile failed: ${res.status}`);
  const profile = (await res.json()) as { emailAddress?: string; historyId?: string };
  return { email: profile.emailAddress ?? "unknown@gmail" };
}

// ── Gmail list / read ──────────────────────────────────────────────────

export interface MessageMeta {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  headers: Record<string, string>;
}

export async function listMessages(accessToken: string, q: string, max = 50): Promise<Pick<MessageMeta, "id">[]> {
  const out: Array<{ id: string }> = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 3; page++) {
    const params = new URLSearchParams({ q, maxResults: String(max) });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`gmail list failed: ${res.status}`);
    const json = (await res.json()) as { messages?: { id: string; threadId: string }[]; nextPageToken?: string };
    if (!json.messages) break;
    out.push(...json.messages.map((m) => ({ id: m.id })));
    pageToken = json.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

export async function getMessage(accessToken: string, id: string): Promise<MessageMeta | null> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=To&metadataHeaders=Date`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    id: string; threadId: string; snippet?: string; internalDate?: string;
    payload?: { headers?: { name: string; value: string }[] };
  };
  const headers: Record<string, string> = {};
  for (const h of json.payload?.headers ?? []) headers[h.name.toLowerCase()] = h.value;
  return {
    id: json.id,
    threadId: json.threadId,
    snippet: decodeEntities(json.snippet ?? ""),
    internalDate: json.internalDate ?? "0",
    headers,
  };
}

/** Fetch and flatten the plain-text body parts of a message (format=full). */
export async function getMessageBody(accessToken: string, id: string): Promise<string> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return "";
  const json = (await res.json()) as { payload?: Parts };
  if (!json.payload) return "";
  return collectText(json.payload).slice(0, 4000);
}

interface Parts {
  mimeType?: string;
  body?: { data?: string; size?: number };
  parts?: Parts[];
}

function collectText(part: Parts): string {
  let out = "";
  if (part.mimeType?.startsWith("text/") && part.body?.data) {
    out += decodeB64Url(part.body.data) + "\n";
  }
  for (const p of part.parts ?? []) out += collectText(p);
  return out;
}

function decodeB64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
