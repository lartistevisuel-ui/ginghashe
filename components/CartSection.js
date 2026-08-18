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
import { addOrder } from "../lib/orders";

export default function CartSection() {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mode: "livraison",
    address: "",
    phone: "",
    note: "",
  });

  useEffect(() => {
    const sync = () => setCart(getCart());
    sync();
    setReady(true);
    window.addEventListener("cart-changed", sync);
    // Nom auto depuis Telegram
    const u =
      typeof window !== "undefined" &&
      window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (u) {
      const n = u.first_name
        ? `${u.first_name}${u.last_name ? " " + u.last_name : ""}`
        : u.username || "";
      if (n) setForm((f) => ({ ...f, name: n }));
    }
    return () => window.removeEventListener("cart-changed", sync);
  }, []);

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const [sending, setSending] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  const total = cart.reduce((t, c) => t + parsePrice(c.price) * c.qty, 0);

  async function commander() {
    if (!form.name.trim()) {
      setOrderStatus({ type: "err", msg: "Indique ton nom." });
      return;
    }
    if (form.mode === "livraison" && !form.address.trim()) {
      setOrderStatus({ type: "err", msg: "Indique ton adresse de livraison." });
      return;
    }

    const tg = typeof window !== "undefined" && window.Telegram?.WebApp;
    const username = tg?.initDataUnsafe?.user?.username || "";

    setSending(true);
    setOrderStatus(null);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          total: `${total.toFixed(2)} €`,
          customer: {
            name: form.name,
            mode: form.mode === "livraison" ? "Livraison" : "Meet-up",
            address: form.address,
            phone: form.phone,
            note: form.note,
            username,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Envoi échoué");
      tg?.HapticFeedback?.notificationOccurred?.("success");
      addOrder({
        items: cart.map((c) => ({
          name: c.name,
          weight: c.weight,
          qty: c.qty,
        })),
        total: `${total.toFixed(2)} €`,
        mode: form.mode === "livraison" ? "Livraison" : "Meet-up",
      });
      clearCart();
      setOrderStatus({
        type: "ok",
        msg: "Commande envoyée ✓ On te recontacte vite 👑",
      });
    } catch (err) {
      setOrderStatus({ type: "err", msg: err.message });
    } finally {
      setSending(false);
    }
  }

  if (!ready) return <p className={ui.muted}>Chargement…</p>;

  if (orderStatus && orderStatus.type === "ok") {
    return (
      <div className={ui.empty}>
        <span className={styles.bigCart}>✅</span>
        <span className={ui.emptyTitle}>Commande envoyée !</span>
        <span className={ui.muted}>{orderStatus.msg}</span>
        <Link href="/" className={styles.shopLink}>
          Retour à l'accueil →
        </Link>
      </div>
    );
  }

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

      <div className={styles.form}>
        <span className={styles.formTitle}>Informations de commande</span>

        <label className={styles.field}>
          <span className={styles.lbl}>Nom *</span>
          <input className={styles.input} value={form.name} onChange={setF("name")} placeholder="Ton nom" />
        </label>

        <div className={styles.modeRow}>
          <button
            type="button"
            className={`${styles.modeBtn} ${form.mode === "livraison" ? styles.modeActive : ""}`}
            onClick={() => setForm((f) => ({ ...f, mode: "livraison" }))}
          >
            🚚 Livraison
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${form.mode === "meetup" ? styles.modeActive : ""}`}
            onClick={() => setForm((f) => ({ ...f, mode: "meetup" }))}
          >
            📍 Meet-up
          </button>
        </div>

        <label className={styles.field}>
          <span className={styles.lbl}>
            {form.mode === "livraison" ? "Adresse de livraison *" : "Lieu / précisions"}
          </span>
          <textarea
            className={styles.input}
            rows={2}
            value={form.address}
            onChange={setF("address")}
            placeholder={form.mode === "livraison" ? "Adresse complète…" : "Où / quand se retrouver…"}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.lbl}>Contact (téléphone / Telegram) — optionnel</span>
          <input className={styles.input} value={form.phone} onChange={setF("phone")} placeholder="@pseudo ou n°" />
        </label>

        <label className={styles.field}>
          <span className={styles.lbl}>Note — optionnel</span>
          <input className={styles.input} value={form.note} onChange={setF("note")} placeholder="Un message…" />
        </label>
      </div>

      {orderStatus && orderStatus.type === "err" && (
        <div className={styles.err}>{orderStatus.msg}</div>
      )}

      <button
        className={styles.checkout}
        type="button"
        onClick={commander}
        disabled={sending}
      >
        {sending ? "Envoi…" : "Commander"}
      </button>
      <button className={styles.clear} type="button" onClick={clearCart}>
        Vider le panier
      </button>
    </div>
  );
}
