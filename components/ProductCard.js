"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ProductCard.module.css";
import { TruckIcon, PinIcon, EyeIcon, StarIcon, ChevronDownIcon } from "./Icons";
import { isFav, toggleFav } from "../lib/favorites";

export default function ProductCard({ product, fluid }) {
  const tiers =
    Array.isArray(product.prices) && product.prices.length
      ? product.prices
      : [{ weight: product.weight, price: product.price }];

  const [idx, setIdx] = useState(0);
  const current = tiers[idx] || tiers[0];
  const multi = tiers.length > 1;

  const [fav, setFav] = useState(false);
  useEffect(() => {
    setFav(isFav(product.id));
    const sync = () => setFav(isFav(product.id));
    window.addEventListener("favs-changed", sync);
    return () => window.removeEventListener("favs-changed", sync);
  }, [product.id]);

  return (
    <article className={`${styles.card} ${fluid ? styles.fluid : ""}`}>
      <div className={styles.media}>
        <img
          src={product.image || "/product-placeholder.svg"}
          alt={product.name}
          className={styles.image}
        />

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

        <button
          className={`${styles.fav} ${fav ? styles.favActive : ""}`}
          type="button"
          aria-label="Favori"
          aria-pressed={fav}
          onClick={() => setFav(toggleFav(product.id).includes(product.id))}
        >
          <StarIcon size={15} />
        </button>

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
        <h3 className={styles.name}>{product.name}</h3>
        {product.grade && <span className={styles.grade}>{product.grade}</span>}
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}

        {product.variant && (
          <button className={styles.variant} type="button">
            <span>{product.variant}</span>
            <ChevronDownIcon className={styles.chevron} size={15} />
          </button>
        )}

        {multi && (
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
        )}

        <div className={styles.priceRow}>
          <span className={styles.weight}>{current.weight}</span>
          <span className={styles.price}>{current.price}</span>
        </div>

        <Link href={`/produit/${product.id}`} className={styles.cta}>
          VOIR LE PRODUIT
        </Link>
      </div>
    </article>
  );
}
