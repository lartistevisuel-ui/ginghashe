import Link from "next/link";
import { notFound } from "next/navigation";
import Page from "../../../components/Page";
import ProductCard from "../../../components/ProductCard";
import { categories } from "../../../data/categories";
import { getProductsFromDB } from "../../../lib/products-db";
import ui from "../../../components/UI.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const cat = categories.find((c) => c.id === params.id);
  return { title: cat ? `${cat.label} — KINGHASH 94` : "Catégorie" };
}

export default async function CategoryPage({ params }) {
  const cat = categories.find((c) => c.id === params.id);
  if (!cat) notFound();

  const db = await getProductsFromDB();
  const list = (db || []).filter((p) => p.category === cat.id);

  return (
    <Page
      title={cat.label}
      subtitle={`${list.length} produit${list.length > 1 ? "s" : ""}`}
    >
      <div className={ui.stack}>
        <Link href="/" className={ui.backLink}>
          ← Accueil
        </Link>
        {list.length === 0 ? (
          <p className={ui.muted}>Aucun produit dans cette catégorie pour l'instant.</p>
        ) : (
          list.map((p) => <ProductCard key={p.id} product={p} fluid />)
        )}
      </div>
    </Page>
  );
}
