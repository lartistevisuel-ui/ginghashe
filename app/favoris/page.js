import Page from "../../components/Page";
import FavoritesSection from "../../components/FavoritesSection";

export const metadata = { title: "Favoris — KINGHASH 94" };

export default function FavorisPage() {
  return (
    <Page title="Favoris" subtitle="Tes produits préférés">
      <FavoritesSection />
    </Page>
  );
}
