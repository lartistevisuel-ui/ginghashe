"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProductDetail.module.css";
import { TruckIcon, PinIcon, EyeIcon } from "./Icons";
import { addToCart } from "../lib/cart";
import ProductReviews from "./ProductReviews";

export default function ProductDetail({ product }) {
  const tiers =
    Array.isArray(product.prices) && product.prices.length
      ? product.prices
      : [{ weight: product.weight, price: product.price }];

  const [idx, setIdx] = useState(0);
  const current = tiers[idx] || tiers[0];
  const multi = tiers.length > 1;

  const [added, setAdded] = useState(false);

  function ajouterAuPanier() {
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      weight: current.weight,
      price: current.price,
    });
    const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
    tg?.HapticFeedback?.impactOccurred?.("light");
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <main className={styles.page}>
      <div className={styles.media}>
        <img
          src={product.image || "/product-placeholder.svg"}
          alt={product.name}
          className={styles.image}
        />

        <Link href="/produits" className={styles.back} aria-label="Retour">
          ←
        </Link>

        <div className={styles.badges}>
          {product.postal && (
            <span className={`${styles.badge} ${styles.postal}`}>
              <TruckIcon className={styles.badgeIcon} size={13} /> LIVRAISON
            </span>
          )}
          {product.meetup && (
            <span className={`${styles.badge} ${styles.meetup}`}>
              <PinIcon className={styles.badgeIcon} size={13} /> MEET-UP
            </span>
          )}
          {product.vitrine && (
            <span className={`${styles.badge} ${styles.vitrine}`}>
              <EyeIcon className={styles.badgeIcon} size={13} /> VITRINE
            </span>
          )}
        </div>

        {product.soldout && (
          <div className={styles.soldout}>
            <svg
              className={styles.soldoutBan}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="9" />
              <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" strokeLinecap="round" />
            </svg>
            <span className={styles.soldoutLabel}>RUPTURE</span>
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h1 className={styles.name}>{product.name}</h1>
        {product.grade && <span className={styles.grade}>{product.grade}</span>}
        {product.variant && <div className={styles.variant}>🌿 {product.variant}</div>}
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        {multi && (
          <>
            <span className={styles.pickLabel}>Choisis la quantité</span>
            <div className={styles.weights}>
              {tiers.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.weightChip} ${i === idx ? styles.weightChipActive : ""}`}
                  onClick={() => setIdx(i)}
                >
                  {t.weight}
                </button>
              ))}
            </div>
          </>
        )}

        <div className={styles.priceRow}>
          <span className={styles.priceLbl}>{current.weight || "Prix"}</span>
          <span className={styles.price}>{current.price}</span>
        </div>

        <button
          className={styles.cta}
          type="button"
          onClick={ajouterAuPanier}
          disabled={product.soldout}
        >
          {product.soldout
            ? "Produit en rupture"
            : added
            ? "Ajouté au panier ✓"
            : "🛒 Ajouter au panier"}
        </button>

        <Link href="/panier" className={styles.viewCart}>
          Voir mon panier →
        </Link>
      </div>

      <ProductReviews productId={product.id} />
    </main>
  );
}
