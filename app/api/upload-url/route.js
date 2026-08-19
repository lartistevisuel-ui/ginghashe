import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const URL_BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Crée une URL d'upload signée (upload direct client -> Supabase, sans limite Vercel)
export async function POST(req) {
  if (!URL_BASE || !KEY) {
    return NextResponse.json({ error: "Stockage non configuré." }, { status: 500 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const ext =
    (body.name || "video.mp4").split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "mp4";
  const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const res = await fetch(
    `${URL_BASE}/storage/v1/object/upload/sign/products/${path}`,
    { method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  );
  if (!res.ok) {
    return NextResponse.json(
      { error: `Signature échouée : ${await res.text()}` },
      { status: 500 }
    );
  }
  const d = await res.json();
  return NextResponse.json({
    uploadUrl: `${URL_BASE}/storage/v1${d.url}`,
    publicUrl: `${URL_BASE}/storage/v1/object/public/products/${path}`,
  });
}
