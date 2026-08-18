"use client";

import { useEffect, useState } from "react";
import styles from "./ReviewsCarousel.module.css";
import { products as staticBest } from "../data/products";
import { newArrivals as staticNew } from "../data/newArrivals";

const COLORS = ["#4f8bff", "#4fe0a0", "#e879f9", "#f2c14e", "#c084fc", "#fb923c"];
function colorFor(s) {
  let h = 0;
  for (let i = 0; i < (s || "").length; i++) h = (h + s.charCodeAt(i)) % COLORS.length;
  return COLORS[h];
}
function starStr(n) {
  const s = Math.max(0, Math.min(5, Number(n) || 0));
  return "★".repeat(s);
}
function shortDate(ts) {
  try {
    return new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState([]);
  const [prodMap, setProdMap] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          fetch("/api/reviews", { cache: "no-store" }),
          fetch("/api/products", { cache: "no-store" }),
        ]);
        const rev = await rRes.json();
        const prods = await pRes.json();
        const all = [
          ...(Array.isArray(prods) ? prods : []),
          ...staticBest,
          ...staticNew,
        ];
        const map = {};
        all.forEach((p) => {
          if (p && p.id) map[p.id] = { name: p.name, image: p.image };
        });
        if (mounted) {
          setReviews(Array.isArray(rev) ? rev.slice(0, 15) : []);
          setProdMap(map);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (reviews.length === 0) return null;

  const avg = (
    reviews.reduce((t, r) => t + (Number(r.stars) || 0), 0) / reviews.length
  ).toFixed(1);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.icon}>💬</span> Avis clients
        </h2>
        <span className={styles.avg}>
          <span className={styles.avgStars}>★★★★★</span> {avg} · {reviews.length}
        </span>
      </div>

      <div className={styles.carousel}>
        {reviews.map((r) => {
          const prod = prodMap[r.product_id];
          const color = colorFor(r.author);
          return (
            <article key={r.id} className={styles.card}>
              <div className={styles.top}>
                <span className={styles.stars}>{starStr(r.stars)}</span>
                <span className={styles.date}>{shortDate(r.created_at)}</span>
              </div>
              <p className={styles.text}>{r.message}</p>
              <div className={styles.foot}>
                {prod && (
                  <div className={styles.prod}>
                    <img
                      src={prod.image || "/product-placeholder.svg"}
                      alt=""
                      className={styles.prodImg}
                    />
                    <span className={styles.prodName}>{prod.name}</span>
                  </div>
                )}
                <div className={styles.author}>
                  <span className={styles.avatar} style={{ background: color }}>
                    {(r.author || "?").charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.authorName}>{r.author}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
