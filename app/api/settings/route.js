import { NextResponse } from "next/server";
import { getSettings, setSetting } from "../../../lib/products-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getSettings();
  return NextResponse.json(data || {});
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }
  if (!body.key) {
    return NextResponse.json({ error: "clé manquante." }, { status: 400 });
  }
  try {
    await setSetting(String(body.key), String(body.value));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
