import { redirect } from "next/navigation";
import ChatSection from "../../components/ChatSection";
import { getSettings } from "../../lib/products-db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tchat — KINGHASH 94" };

export default async function TchatPage() {
  const s = await getSettings();
  if (s && s.chat_enabled === "false") redirect("/");
  return <ChatSection />;
}
