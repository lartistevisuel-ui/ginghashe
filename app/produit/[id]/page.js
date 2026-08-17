import { notFound } from "next/navigation";
import ProductDetail from "../../../components/ProductDetail";
import { getProductByIdFromDB } from "../../../lib/products-db";
import { products } from "../../../data/products";
import { newArrivals } from "../../../data/newArrivals";

export const dynamic = "force-dynamic";

async function findProduct(id) {
  const fromDb = await getProductByIdFromDB(id);
  if (fromDb) return fromDb;
  return [...products, ...newArrivals].find((p) => p.id === id) || null;
}

export async function generateMetadata({ params }) {
  const product = await findProduct(params.id);
  return { title: product ? `${product.name} — KINGHASH 94` : "Produit" };
}

export default async function ProduitPage({ params }) {
  const product = await findProduct(params.id);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
