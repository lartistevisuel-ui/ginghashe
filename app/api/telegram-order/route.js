import { NextResponse } from "next/server";
import {
  setOrderStatus,
  setReviewApproved,
  deleteReviewFromDB,
} from "../../../lib/products-db";

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
    const original = cb.message?.text || "";
    const chat_id = cb.message?.chat?.id;
    const message_id = cb.message?.message_id;

    // Validation des avis : review:approve:<id> / review:reject:<id>
    if (data.startsWith("review:")) {
      const [, sub, reviewId] = data.split(":");
      let line = "";
      let toast = "";
      if (sub === "approve") {
        if (reviewId) {
          try {
            await setReviewApproved(reviewId, true);
          } catch {}
        }
        line = "\n\n✅ AVIS PUBLIÉ";
        toast = "Avis publié ✅";
      } else if (sub === "reject") {
        if (reviewId) {
          try {
            await deleteReviewFromDB(reviewId);
          } catch {}
        }
        line = "\n\n🗑 AVIS REJETÉ";
        toast = "Avis rejeté 🗑";
      }
      if (line) {
        await tg("editMessageText", { chat_id, message_id, text: original + line });
      }
      await tg("answerCallbackQuery", { callback_query_id: cb.id, text: toast });
      return NextResponse.json({ ok: true });
    }

    const [action, orderId] = data.split(":");

    const config = {
      accept: {
        status: "accepted",
        line: "\n\n✅ COMMANDE ACCEPTÉE",
        toast: "Acceptée ✅",
        // Un bouton pour finaliser apparaît
        keyboard: {
          inline_keyboard: [
            [
              {
                text: "🏁 Finaliser la commande",
                callback_data: orderId ? `finalize:${orderId}` : "finalize",
              },
            ],
          ],
        },
      },
      finalize: {
        status: "finalized",
        line: "\n🏁 COMMANDE FINALISÉE — produit remis",
        toast: "Finalisée 🏁",
        keyboard: undefined, // retire les boutons
      },
      refuse: {
        status: "refused",
        line: "\n\n❌ COMMANDE REFUSÉE",
        toast: "Refusée ❌",
        keyboard: undefined,
      },
    };

    const conf = config[action];
    if (conf) {
      if (orderId) {
        try {
          await setOrderStatus(orderId, conf.status);
        } catch {
          /* ignore */
        }
      }
      await tg("editMessageText", {
        chat_id,
        message_id,
        text: original + conf.line,
        ...(conf.keyboard ? { reply_markup: conf.keyboard } : {}),
      });
      await tg("answerCallbackQuery", {
        callback_query_id: cb.id,
        text: conf.toast,
      });
    } else {
      await tg("answerCallbackQuery", { callback_query_id: cb.id });
    }
  }

  return NextResponse.json({ ok: true });
}
