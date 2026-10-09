import { NextResponse } from "next/server";
import { getCatalog } from "@/db/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return NextResponse.json(await getCatalog()); }
  catch (error) {
    console.error("Unable to load KENDO FARM catalog", error);
    return NextResponse.json({ error: "The garden catalog is temporarily unavailable." }, { status: 503 });
  }
}
