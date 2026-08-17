"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CartSection.module.css";
import ui from "./UI.module.css";
import {
  getCart,
  setQty,
  removeFromCart,
  clearCart,
  parsePrice,
} from "../lib/cart";

export default function CartSection() {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();
    setReady(true);
    window.addEventListener("cart-changed", sync);
    return () => window.removeEventListener("cart-changed", sync);
  }, []);

  const total = cart.reduce((t, c) => t + parsePrice(c.price) * c.qty, 0);

  function commander() {
    const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
    const lines = cart
      .map(
        (c) =>
          `• ${c.name}${c.weight ? " (" + c.weight + ")" : ""} x${c.qty} — ${c.price}`
      )
      .join("\n");
    const msg = `Ma commande :\n${lines}\n\nTotal : ${total.toFixed(2)} €`;
    if (tg && tg.showAlert) {
      tg.HapticFeedback?.impactOccurred?.("medium");
      tg.showAlert(`${msg}\n\nContacte-nous pour finaliser 👑`);
    } else {
      alert(msg);
    }
  }

  if (!ready) return <p className={ui.muted}>Chargement…</p>;

  if (cart.length === 0) {
    return (
      <div className={ui.empty}>
        <span className={styles.bigCart}>🛒</span>
        <span className={ui.emptyTitle}>Ton panier est vide</span>
        <span className={ui.muted}>Ajoute des produits pour les retrouver ici.</span>
        <Link href="/produits" className={styles.shopLink}>
          Voir les produits →
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {cart.map((c) => (
        <div key={c.key} className={styles.row}>
          <img
            src={c.image || "/product-placeholder.svg"}
            alt=""
            className={styles.thumb}
          />
          <div className={styles.info}>
            <span className={styles.name}>{c.name}</span>
            {c.weight && <span className={styles.weight}>{c.weight}</span>}
            <span className={styles.price}>{c.price}</span>
          </div>
          <div className={styles.right}>
            <div className={styles.qty}>
              <button
                type="button"
                onClick={() => setQty(c.key, c.qty - 1)}
                aria-label="Moins"
              >
                −
              </button>
              <span>{c.qty}</span>
              <button
                type="button"
                onClick={() => setQty(c.key, c.qty + 1)}
                aria-label="Plus"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={styles.remove}
              onClick={() => removeFromCart(c.key)}
            >
              Retirer
            </button>
          </div>
        </div>
      ))}

      <div className={styles.totalRow}>
        <span>Total</span>
        <span className={styles.total}>{total.toFixed(2)} €</span>
      </div>

      <button className={styles.checkout} type="button" onClick={commander}>
        Commander
      </button>
      <button className={styles.clear} type="button" onClick={clearCart}>
        Vider le panier
      </button>
    </div>
  );
}
