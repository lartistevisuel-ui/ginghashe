import { NextResponse } from "next/server";
import {
  getProductsFromDB,
  addProductToDB,
  deleteProductFromDB,
} from "../../../lib/products-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getProductsFromDB();
  return NextResponse.json(data || []);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.name || !body.price) {
    return NextResponse.json(
      { error: "Le nom et le prix sont obligatoires." },
      { status: 400 }
    );
  }

  const prices = Array.isArray(body.prices)
    ? body.prices
        .map((t) => ({
          weight: t.weight ? String(t.weight).trim() : "",
          price: t.price ? String(t.price).trim() : "",
        }))
        .filter((t) => t.weight || t.price)
    : [];

  const product = {
    name: String(body.name).trim(),
    grade: body.grade ? String(body.grade).trim() : "",
    description: body.description ? String(body.description).trim() : "",
    variant: body.variant ? String(body.variant).trim() : "",
    weight: body.weight ? String(body.weight).trim() : "",
    price: String(body.price).trim(),
    prices,
    postal: Boolean(body.postal),
    meetup: Boolean(body.meetup),
    vitrine: Boolean(body.vitrine),
    image: body.image ? String(body.image).trim() : "/product-placeholder.svg",
    section: body.section === "new" ? "new" : "best",
  };

  try {
    const created = await addProductToDB(product);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id manquant." }, { status: 400 });
  }
  try {
    await deleteProductFromDB(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
