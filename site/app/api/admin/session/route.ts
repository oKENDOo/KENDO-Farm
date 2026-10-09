import { NextRequest, NextResponse } from "next/server";
import { AuthError, authCookie, requireAdmin, signInWithPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  const status = error instanceof AuthError ? error.status : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  try { return NextResponse.json({ user: await requireAdmin(request) }); }
  catch (error) { return failure(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") throw new AuthError("Email and password are required.", 400);
    const session = await signInWithPassword(email.trim(), password);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(authCookie.name, session.access_token, authCookie.options(session.expires_in ?? 60 * 60 * 12));
    return response;
  } catch (error) { return failure(error); }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookie.name, "", authCookie.options(0));
  return response;
}
