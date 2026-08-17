import Splash from "../components/Splash";
import Home from "../components/Home";
import { getProductsFromDB } from "../lib/products-db";
import { products as staticBest } from "../data/products";
import { newArrivals as staticNew } from "../data/newArrivals";

export const dynamic = "force-dynamic";

export default async function Page() {
  let bestSellers = staticBest;
  let nouveautes = staticNew;

  const db = await getProductsFromDB();
  if (db && db.length) {
    const dbBest = db.filter((p) => p.section !== "new");
    const dbNew = db.filter((p) => p.section === "new");
    if (dbBest.length) bestSellers = dbBest;
    if (dbNew.length) nouveautes = dbNew;
  }

  return (
    <>
      <Splash />
      <Home bestSellers={bestSellers} nouveautes={nouveautes} />
    </>
  );
}
