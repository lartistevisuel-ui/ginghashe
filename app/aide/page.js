import Page from "../../components/Page";
import ui from "../../components/UI.module.css";

export const metadata = { title: "Aide — KINGHASH 94" };

const FAQ = [
  {
    q: "Comment passer commande ?",
    a: "Choisis un produit, sélectionne la variété et la quantité, puis contacte-nous pour finaliser.",
  },
  {
    q: "Quels modes de réception ?",
    a: "Livraison (badge LIVRAISON) ou remise en main propre (badge MEET-UP) selon le produit.",
  },
  {
    q: "Quels sont les délais ?",
    a: "Livraison rapide, et nouveautés ajoutées chaque semaine. Écris-nous pour les délais exacts.",
  },
];

export default function AidePage() {
  return (
    <Page title="Aide" subtitle="Questions fréquentes & contact">
      <div className={ui.stack}>
        {FAQ.map((item, i) => (
          <div key={i} className={ui.panel}>
            <p className={ui.faqQ}>{item.q}</p>
            <p className={ui.faqA}>{item.a}</p>
          </div>
        ))}
        <div className={ui.panel}>
          <p className={ui.faqQ}>Une autre question ?</p>
          <p className={ui.faqA} style={{ marginBottom: 12 }}>
            Contacte-nous directement, on te répond vite.
          </p>
          <button className={ui.btn} type="button">
            Nous contacter
          </button>
        </div>
      </div>
    </Page>
  );
}
