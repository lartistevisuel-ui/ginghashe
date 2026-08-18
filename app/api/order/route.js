import { NextResponse } from "next/server";
import { addOrderToDB } from "../../../lib/products-db";

export const dynamic = "force-dynamic";

// Bot dédié aux commandes (indépendant du bot de la mini-app).
// Repli sur TELEGRAM_BOT_TOKEN si un seul bot est utilisé.
const TOKEN =
  process.env.TELEGRAM_ORDER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const ADMIN = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function POST(req) {
  if (!TOKEN || !ADMIN) {
    return NextResponse.json(
      { error: "Réception non configurée (TELEGRAM_ADMIN_CHAT_ID manquant)." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { items, total, customer } = body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Panier vide." }, { status: 400 });
  }
  if (!customer || !customer.name) {
    return NextResponse.json({ error: "Infos client manquantes." }, { status: 400 });
  }

  // Enregistre la commande en base (pour le suivi de statut côté client)
  const saved = await addOrderToDB({
    uid: customer.uid ? String(customer.uid) : "",
    customer_name: customer.name,
    mode: customer.mode,
    address: customer.address || "",
    phone: customer.phone || "",
    note: customer.note || "",
    items,
    total: String(total),
    status: "pending",
  });
  const orderId = saved?.id || "";

  const lines = items
    .map(
      (c) =>
        `• ${c.name}${c.weight ? " (" + c.weight + ")" : ""} x${c.qty} — ${c.price}`
    )
    .join("\n");

  const text =
    `🛒 NOUVELLE COMMANDE KINGHASH 94\n\n` +
    `${lines}\n\n` +
    `💰 Total : ${total}\n\n` +
    `👤 ${customer.name}\n` +
    `📦 Mode : ${customer.mode}\n` +
    `${customer.mode === "Livraison" ? "🏠 Adresse" : "📍 Lieu"} : ${customer.address || "-"}` +
    (customer.phone ? `\n📞 Contact : ${customer.phone}` : "") +
    (customer.username ? `\n💬 Telegram : @${customer.username}` : "") +
    (customer.note ? `\n📝 Note : ${customer.note}` : "");

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ADMIN,
      text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Accepter",
              callback_data: orderId ? `accept:${orderId}` : "accept",
            },
            {
              text: "❌ Refuser",
              callback_data: orderId ? `refuse:${orderId}` : "refuse",
            },
          ],
        ],
      },
    }),
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Envoi échoué : ${await res.text()}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: orderId });
}
