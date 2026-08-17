import Page from "../../components/Page";
import ui from "../../components/UI.module.css";
import { StarIcon } from "../../components/Icons";

export const metadata = { title: "Favoris — KINGHASH 94" };

export default function FavorisPage() {
  return (
    <Page title="Favoris" subtitle="Tes produits préférés">
      <div className={ui.empty}>
        <StarIcon size={44} className={ui.emptyIcon} />
        <span className={ui.emptyTitle}>Aucun favori pour l'instant</span>
        <span className={ui.muted}>
          Touche l'étoile en haut d'un produit pour l'ajouter à tes favoris.
        </span>
      </div>
    </Page>
  );
}
