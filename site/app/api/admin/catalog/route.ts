import { NextRequest, NextResponse } from "next/server";
import { getAdminCatalog } from "@/db/repository";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    return NextResponse.json(await getAdminCatalog());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load dashboard." }, { status: error instanceof AuthError ? error.status : 500 });
  }
}
