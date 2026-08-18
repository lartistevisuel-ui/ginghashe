import Page from "../../components/Page";
import ui from "../../components/UI.module.css";
import OrdersTracker from "../../components/OrdersTracker";

export const metadata = { title: "Compte — KINGHASH 94" };

export default function ComptePage() {
  return (
    <Page title="Compte" subtitle="Ton profil KINGHASH 94">
      <div className={ui.stack}>
        <div className={ui.panel}>
          <div className={ui.profile}>
            <span className={ui.avatar}>
              <svg
                viewBox="0 0 24 24"
                width="26"
                height="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8.5" r="3.5" />
                <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <div className={ui.profileName}>Invité</div>
              <div className={ui.muted}>Connecte-toi pour retrouver tes commandes</div>
            </div>
          </div>
        </div>

        <div className={ui.panel}>
          <p className={ui.faqQ}>📦 Suivi de commande</p>
          <OrdersTracker />
        </div>
      </div>
    </Page>
  );
}
