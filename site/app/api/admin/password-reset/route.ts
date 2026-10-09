import { NextRequest, NextResponse } from "next/server";
import { AuthError, sendPasswordReset } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !email.trim()) throw new AuthError("Email is required.", 400);
    await sendPasswordReset(email.trim(), new URL("/admin", request.url).toString());
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: error instanceof AuthError ? error.status : 500 });
  }
}
