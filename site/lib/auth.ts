import type { NextRequest } from "next/server";

const SESSION_COOKIE = "kendo_admin_session";

type SupabaseSession = { access_token: string; expires_in?: number };
type SupabaseUser = { id: string; email?: string | null };

export class AuthError extends Error {
  constructor(message: string, public status = 401) {
    super(message);
  }
}

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new AuthError("Authentication has not been configured yet.", 503);
  return { url, anonKey };
}

function allowedEmails() {
  return new Set((process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean));
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const { url, anonKey } = config();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: { apikey: anonKey, ...(init.headers ?? {}) },
    cache: "no-store",
  });
  return response;
}

export async function signInWithPassword(email: string, password: string) {
  const response = await supabaseFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = (await response.json().catch(() => null)) as SupabaseSession | { error_description?: string; msg?: string } | null;
  if (!response.ok || !body || !("access_token" in body)) {
    throw new AuthError((body && ("error_description" in body ? body.error_description : body.msg)) || "Incorrect email or password.", 401);
  }

  const user = await getUser(body.access_token);
  ensureAllowed(user);
  return body;
}

async function getUser(accessToken: string): Promise<SupabaseUser> {
  const response = await supabaseFetch("/auth/v1/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new AuthError("Your session has expired. Please sign in again.", 401);
  return (await response.json()) as SupabaseUser;
}

function ensureAllowed(user: SupabaseUser) {
  const email = user.email?.toLowerCase();
  if (!email || !allowedEmails().has(email)) throw new AuthError("This email is not approved to manage KENDO FARM.", 403);
  return { id: user.id, email };
}

export async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError("Please sign in to continue.", 401);
  return ensureAllowed(await getUser(token));
}

export async function sendPasswordReset(email: string, redirectTo: string) {
  const response = await supabaseFetch("/auth/v1/recover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, options: { redirectTo } }),
  });
  if (!response.ok) throw new AuthError("Unable to send a password reset email right now.", 502);
}

export const authCookie = {
  name: SESSION_COOKIE,
  options: (maxAge = 60 * 60 * 12) => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge }),
};
