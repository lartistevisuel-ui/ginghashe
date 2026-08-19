import { NextResponse } from "next/server";
import {
  getReviewsFromDB,
  addReviewToDB,
  deleteReviewFromDB,
} from "../../../lib/products-db";

export const dynamic = "force-dynamic";

const TOKEN =
  process.env.TELEGRAM_ORDER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");
  const all = searchParams.get("all") === "1";
  // Public : uniquement les avis approuvés. Admin (all=1) : tous les avis.
  const data = await getReviewsFromDB(productId || undefined, !all);
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

  const images = Array.isArray(body.images)
    ? body.images.filter((u) => typeof u === "string").slice(0, 6)
    : [];

  const review = {
    author: String(body.author).trim().slice(0, 60),
    message: String(body.message).trim().slice(0, 500),
    stars,
    product_id: body.product_id ? String(body.product_id).slice(0, 60) : "",
    images,
    approved: false,
  };

  try {
    const created = await addReviewToDB(review);

    // Envoie l'avis à l'admin pour validation
    if (TOKEN && ADMIN && created?.id) {
      const text =
        `⭐ NOUVEL AVIS (à valider)\n\n` +
        `👤 ${review.author}\n` +
        `Note : ${"★".repeat(stars)}${"☆".repeat(5 - stars)}\n` +
        (review.product_id ? `Produit : ${review.product_id}\n` : "") +
        (images.length ? `📷 ${images.length} image(s)\n` : "") +
        `\n${review.message}`;
      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN,
          text,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ Publier", callback_data: `review:approve:${created.id}` },
                { text: "🗑 Rejeter", callback_data: `review:reject:${created.id}` },
              ],
            ],
          },
        }),
      });
    }

    return NextResponse.json({ ok: true, id: created?.id }, { status: 201 });
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
