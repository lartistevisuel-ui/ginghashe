"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { StarIcon } from "./Icons";
import { getFavs } from "../lib/favorites";
import { products as staticBest } from "../data/products";
import { newArrivals as staticNew } from "../data/newArrivals";
import ui from "./UI.module.css";

export default function FavoritesSection() {
  const [all, setAll] = useState([]);
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let list;
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        list =
          Array.isArray(data) && data.length ? data : [...staticBest, ...staticNew];
      } catch {
        list = [...staticBest, ...staticNew];
      }
      if (mounted) {
        setAll(list);
        setLoading(false);
      }
    })();

    const sync = () => setFavs(getFavs());
    sync();
    window.addEventListener("favs-changed", sync);
    return () => {
      mounted = false;
      window.removeEventListener("favs-changed", sync);
    };
  }, []);

  const favProducts = all.filter((p) => favs.includes(p.id));

  if (loading) return <p className={ui.muted}>Chargement…</p>;

  if (favProducts.length === 0) {
    return (
      <div className={ui.empty}>
        <StarIcon size={44} className={ui.emptyIcon} />
        <span className={ui.emptyTitle}>Aucun favori pour l'instant</span>
        <span className={ui.muted}>
          Touche l'étoile en haut d'un produit pour l'ajouter ici.
        </span>
      </div>
    );
  }

  return (
    <div className={ui.productGrid}>
      {favProducts.map((p) => (
        <ProductCard key={p.id} product={p} fluid />
      ))}
    </div>
  );
}
