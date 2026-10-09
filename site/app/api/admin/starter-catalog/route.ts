import { NextRequest, NextResponse } from "next/server";
import { seedStarterCatalog } from "@/db/repository";
import { AuthError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    return NextResponse.json(await seedStarterCatalog());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add starter inventory." }, { status: error instanceof AuthError ? error.status : 500 });
  }
}
