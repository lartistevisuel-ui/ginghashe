import { NextResponse } from "next/server";
import { getOrdersByIds } from "../../../lib/products-db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids") || "";
  const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return NextResponse.json([]);
  const rows = await getOrdersByIds(ids);
  return NextResponse.json(rows || []);
}
