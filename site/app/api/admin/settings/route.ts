import { NextRequest, NextResponse } from "next/server";
import { saveFarmSettings } from "@/db/repository";
import { AuthError, requireAdmin } from "@/lib/auth";
import { settingsInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(request);
    return NextResponse.json(await saveFarmSettings(settingsInput.parse(await request.json())));
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save settings." }, { status });
  }
}
