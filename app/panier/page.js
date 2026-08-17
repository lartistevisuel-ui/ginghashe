import Page from "../../components/Page";
import CartSection from "../../components/CartSection";

export const metadata = { title: "Panier — KINGHASH 94" };

export default function PanierPage() {
  return (
    <Page title="Mon panier" subtitle="Tes articles sélectionnés">
      <CartSection />
    </Page>
  );
}
