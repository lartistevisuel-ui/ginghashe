import { NextResponse } from "next/server";
import {
  getVerification,
  upsertVerification,
  setVerified,
} from "../../../lib/products-db";

export const dynamic = "force-dynamic";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL || "https://ginghashe.vercel.app";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode(len = 5) {
  let c = "";
  for (let i = 0; i < len; i++)
    c += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return c;
}

async function tg(method, payload) {
  return fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function shopButton() {
  return {
    inline_keyboard: [
      [{ text: "🛒 Ouvrir la boutique", web_app: { url: APP_URL } }],
    ],
  };
}

export async function POST(req) {
  if (!TOKEN) {
    return NextResponse.json({ ok: false, error: "no token" }, { status: 500 });
  }
  if (SECRET && req.headers.get("x-telegram-bot-api-secret-token") !== SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = update.message;
  if (!msg || !msg.chat) return NextResponse.json({ ok: true });
  const chatId = msg.chat.id;
  const text = typeof msg.text === "string" ? msg.text.trim() : "";

  if (text.startsWith("/id")) {
    await tg("sendMessage", {
      chat_id: chatId,
      text: `Ton identifiant de chat : ${chatId}`,
    });
    return NextResponse.json({ ok: true });
  }

  // /start : génère un code de vérification
  if (text.startsWith("/start")) {
    const code = genCode();
    await upsertVerification(chatId, code);
    const name = msg.from?.first_name ? ` ${msg.from.first_name}` : "";
    await tg("sendMessage", {
      chat_id: chatId,
      text:
        `Bienvenue${name} chez KINGHASH 94 👑🔥\n\n` +
        `Pour accéder à la boutique, entre le code ci-dessous 👇\n\n` +
        `▶️   ${code}   ◀️\n\n` +
        `(Recopie-le et envoie-le en message)`,
    });
    return NextResponse.json({ ok: true });
  }

  // Toute autre saisie : tentative de code
  if (text && !text.startsWith("/")) {
    const v = await getVerification(chatId);
    if (v && v.code && text.toUpperCase() === String(v.code).toUpperCase()) {
      await setVerified(chatId);
      await tg("sendMessage", {
        chat_id: chatId,
        text: `✅ Vérification réussie !\n\nBienvenue chez KINGHASH 94 👑🔥\nAppuie sur le bouton pour ouvrir la boutique.`,
        reply_markup: shopButton(),
      });
    } else {
      await tg("sendMessage", {
        chat_id: chatId,
        text: `❌ Code incorrect. Renvoie /start pour obtenir un nouveau code.`,
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
