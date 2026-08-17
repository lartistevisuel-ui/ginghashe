import { NextResponse } from "next/server";
import {
  getReviewsFromDB,
  addReviewToDB,
  deleteReviewFromDB,
} from "../../../lib/products-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getReviewsFromDB();
  return NextResponse.json(data || []);
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  if (!body.author || !body.message) {
    return NextResponse.json(
      { error: "Le nom et le message sont obligatoires." },
      { status: 400 }
    );
  }

  let stars = parseInt(body.stars, 10);
  if (isNaN(stars) || stars < 1) stars = 1;
  if (stars > 5) stars = 5;

  const review = {
    author: String(body.author).trim().slice(0, 60),
    message: String(body.message).trim().slice(0, 500),
    stars,
  };

  try {
    const created = await addReviewToDB(review);
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
    await deleteReviewFromDB(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
