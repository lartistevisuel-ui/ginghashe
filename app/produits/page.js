import Link from "next/link";
import Page from "../../components/Page";
import ProductCard from "../../components/ProductCard";
import { getProductsFromDB } from "../../lib/products-db";
import { products as staticBest } from "../../data/products";
import { newArrivals as staticNew } from "../../data/newArrivals";
import ui from "../../components/UI.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tous les produits — KINGHASH 94" };

export default async function ProduitsPage() {
  const db = await getProductsFromDB();
  const list = db && db.length ? db : [...staticBest, ...staticNew];

  return (
    <Page
      title="Tous les produits"
      subtitle={`${list.length} produit${list.length > 1 ? "s" : ""}`}
    >
      <div className={ui.stack}>
        <Link href="/" className={ui.backLink}>
          ← Accueil
        </Link>
        {list.length === 0 ? (
          <p className={ui.muted}>Aucun produit pour l'instant.</p>
        ) : (
          <div className={ui.productGrid}>
            {list.map((p) => (
              <ProductCard key={p.id} product={p} fluid />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
