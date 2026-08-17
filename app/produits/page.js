import Link from "next/link";
import Page from "../../components/Page";
import ProductCard from "../../components/ProductCard";
import { getProductsFromDB } from "../../lib/products-db";
import { products as staticBest } from "../../data/products";
import { newArrivals as staticNew } from "../../data/newArrivals";
import ui from "../../components/UI.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produits — KINGHASH 94" };

export default async function ProduitsPage({ searchParams }) {
  const section = searchParams?.section;
  const db = await getProductsFromDB();

  let list;
  let title = "Tous les produits";

  if (db && db.length) {
    if (section === "best") {
      list = db.filter((p) => p.section !== "new");
      title = "Best-sellers";
    } else if (section === "new") {
      list = db.filter((p) => p.section === "new");
      title = "Nouveautés";
    } else {
      list = db;
    }
  } else {
    // repli statique
    if (section === "best") {
      list = staticBest;
      title = "Best-sellers";
    } else if (section === "new") {
      list = staticNew;
      title = "Nouveautés";
    } else {
      list = [...staticBest, ...staticNew];
    }
  }

  return (
    <Page
      title={title}
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
