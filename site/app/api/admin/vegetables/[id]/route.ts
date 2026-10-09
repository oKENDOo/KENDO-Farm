import { NextRequest, NextResponse } from "next/server";
import { deleteVegetable, updateVegetable } from "@/db/repository";
import { AuthError, requireAdmin } from "@/lib/auth";
import { vegetableInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    const input = vegetableInput.parse(await request.json());
    return NextResponse.json(await updateVegetable({ ...input, id, updatedAt: new Date().toISOString() }));
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save vegetable." }, { status });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    await deleteVegetable(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete vegetable." }, { status });
  }
}
