import { NextResponse } from "next/server";
import {
  getChatMessages,
  addChatMessage,
  deleteChatMessage,
} from "../../../lib/products-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getChatMessages();
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
      { error: "Nom et message obligatoires." },
      { status: 400 }
    );
  }

  const m = {
    author: String(body.author).trim().slice(0, 60),
    message: String(body.message).trim().slice(0, 500),
    uid: body.uid ? String(body.uid).slice(0, 40) : "",
  };
  if (!m.message) {
    return NextResponse.json({ error: "Message vide." }, { status: 400 });
  }

  try {
    const created = await addChatMessage(m);
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
    await deleteChatMessage(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
