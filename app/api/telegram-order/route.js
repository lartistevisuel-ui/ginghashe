import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Webhook du bot de commandes (@Kingcmdbot) — gère les boutons Accepter / Refuser
const TOKEN =
  process.env.TELEGRAM_ORDER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

async function tg(method, payload) {
  return fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function POST(req) {
  if (!TOKEN) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  let update;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const cb = update.callback_query;
  if (cb) {
    const data = cb.data || "";
    const accepted = data === "accept";
    const refused = data === "refuse";

    if (accepted || refused) {
      const original = cb.message?.text || "";
      const statusLine = accepted
        ? "\n\n✅ COMMANDE ACCEPTÉE"
        : "\n\n❌ COMMANDE REFUSÉE";

      // Met à jour le message et retire les boutons
      await tg("editMessageText", {
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        text: original + statusLine,
      });
      await tg("answerCallbackQuery", {
        callback_query_id: cb.id,
        text: accepted ? "Commande acceptée ✅" : "Commande refusée ❌",
      });
    } else {
      await tg("answerCallbackQuery", { callback_query_id: cb.id });
    }
  }

  return NextResponse.json({ ok: true });
}
