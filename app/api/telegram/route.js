import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;
const APP_URL = process.env.APP_URL || "https://ginghashe.vercel.app";

async function tg(method, payload) {
  return fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function POST(req) {
  if (!TOKEN) {
    return NextResponse.json({ ok: false, error: "no token" }, { status: 500 });
  }
  // Sécurité : Telegram renvoie le secret dans cet en-tête
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
  const text = msg && typeof msg.text === "string" ? msg.text : "";

  if (text.startsWith("/start")) {
    const name = msg.from?.first_name ? ` ${msg.from.first_name}` : "";
    await tg("sendMessage", {
      chat_id: msg.chat.id,
      text: `Bienvenue${name} chez KINGHASH 94 👑🔥\n\nAppuie sur le bouton ci-dessous pour ouvrir la boutique.`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛒 Ouvrir la boutique", web_app: { url: APP_URL } }],
        ],
      },
    });
  }

  return NextResponse.json({ ok: true });
}
