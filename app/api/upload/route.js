import { NextResponse } from "next/server";
import { uploadImageToStorage } from "../../../lib/products-db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Aucun fichier." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image trop lourde (max 5 Mo)." }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const url = await uploadImageToStorage(
      file.name || "image.jpg",
      arrayBuffer,
      file.type
    );
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
