import { NextRequest, NextResponse } from "next/server";
import { createVegetable } from "@/db/repository";
import { AuthError, requireAdmin } from "@/lib/auth";
import { vegetableInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const input = vegetableInput.parse(await request.json());
    return NextResponse.json(await createVegetable({ ...input, id: crypto.randomUUID(), updatedAt: new Date().toISOString() }), { status: 201 });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save vegetable." }, { status });
  }
}
