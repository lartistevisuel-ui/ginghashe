"use client";

import { useEffect, useState } from "react";
import styles from "./OrdersTracker.module.css";
import { getOrders, markOrdersSeen } from "../lib/orders";

function fmt(ts) {
  try {
    return new Date(ts).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function OrdersTracker() {
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOrders(getOrders());
    setReady(true);
    markOrdersSeen(); // en ouvrant la page, on "voit" les commandes → le point rouge s'éteint
    const sync = () => setOrders(getOrders());
    window.addEventListener("orders-changed", sync);
    return () => window.removeEventListener("orders-changed", sync);
  }, []);

  if (!ready) return null;

  if (orders.length === 0) {
    return <p className={styles.empty}>Aucune commande pour l'instant.</p>;
  }

  return (
    <div className={styles.list}>
      {orders.map((o) => (
        <div key={o.id} className={styles.order}>
          <div className={styles.head}>
            <span className={styles.date}>{fmt(o.date)}</span>
            <span className={styles.status}>{o.status}</span>
          </div>
          <div className={styles.items}>
            {(o.items || [])
              .map(
                (i) => `${i.name}${i.weight ? " (" + i.weight + ")" : ""} ×${i.qty}`
              )
              .join(", ")}
          </div>
          <div className={styles.foot}>
            <span className={styles.mode}>{o.mode}</span>
            <span className={styles.total}>{o.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
