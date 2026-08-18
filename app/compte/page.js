import Page from "../../components/Page";
import ui from "../../components/UI.module.css";
import OrdersTracker from "../../components/OrdersTracker";
import AccountProfile from "../../components/AccountProfile";

export const metadata = { title: "Compte — KINGHASH 94" };

export default function ComptePage() {
  return (
    <Page title="Compte" subtitle="Ton profil KINGHASH 94">
      <div className={ui.stack}>
        <div className={ui.panel}>
          <AccountProfile />
        </div>

        <div className={ui.panel}>
          <p className={ui.faqQ}>📦 Suivi de commande</p>
          <OrdersTracker />
        </div>
      </div>
    </Page>
  );
}
