import { NextResponse } from "next/server";
import {
  getCategoriesFromDB,
  addCategoryToDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
} from "../../../lib/products-db";

export const dynamic = "force-dynamic";

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function GET() {
  const data = await getCategoriesFromDB();
  return NextResponse.json(data || []);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }
  if (!body.label) {
    return NextResponse.json({ error: "Le nom est obligatoire." }, { status: 400 });
  }
  const cat = {
    id: body.id ? slugify(body.id) : slugify(body.label) + "-" + Date.now().toString(36).slice(-4),
    label: String(body.label).trim().slice(0, 40),
    color: body.color ? String(body.color).slice(0, 20) : "#4f8bff",
    icon: body.icon ? String(body.icon).slice(0, 20) : "",
    position: Number(body.position) || 99,
  };
  try {
    const created = await addCategoryToDB(cat);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }
  const fields = {};
  if (body.label !== undefined) fields.label = String(body.label).trim().slice(0, 40);
  if (body.color !== undefined) fields.color = String(body.color).slice(0, 20);
  if (body.icon !== undefined) fields.icon = String(body.icon).slice(0, 20);
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour." }, { status: 400 });
  }
  try {
    const updated = await updateCategoryInDB(id, fields);
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant." }, { status: 400 });
  try {
    await deleteCategoryFromDB(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
