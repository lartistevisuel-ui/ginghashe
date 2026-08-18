import Page from "../../components/Page";
import ChatSection from "../../components/ChatSection";

export const metadata = { title: "Tchat — KINGHASH 94" };

export default function TchatPage() {
  return (
    <Page title="Tchat" subtitle="Discute avec la communauté">
      <ChatSection />
    </Page>
  );
}
