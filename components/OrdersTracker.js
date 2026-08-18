"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./OrdersTracker.module.css";
import {
  getOrders,
  markOrdersSeen,
  updateStatuses,
  orderIds,
} from "../lib/orders";

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

const STATUS = {
  pending: { label: "⏳ En attente de confirmation", cls: "pending" },
  accepted: { label: "✅ Acceptée — on va vous contacter", cls: "accepted" },
  finalized: { label: "🏁 Finalisée — produit récupéré 🎉", cls: "finalized" },
  refused: { label: "❌ Commande refusée", cls: "refused" },
};

export default function OrdersTracker() {
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => setOrders(getOrders()), []);

  const poll = useCallback(async () => {
    const ids = orderIds();
    if (ids.length === 0) return;
    try {
      const res = await fetch(`/api/orders?ids=${ids.join(",")}`, {
        cache: "no-store",
      });
      const rows = await res.json();
      updateStatuses(rows);
      refresh();
      markOrdersSeen(); // on regarde la page → statuts vus
    } catch {
      /* ignore */
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
    setReady(true);
    markOrdersSeen();
    poll();
    const t = setInterval(poll, 8000);
    const sync = () => refresh();
    window.addEventListener("orders-changed", sync);
    return () => {
      clearInterval(t);
      window.removeEventListener("orders-changed", sync);
    };
  }, [poll, refresh]);

  if (!ready) return null;

  if (orders.length === 0) {
    return <p className={styles.empty}>Aucune commande pour l'instant.</p>;
  }

  return (
    <div className={styles.list}>
      {orders.map((o) => {
        const st = STATUS[o.status] || STATUS.pending;
        return (
          <div key={o.id || o.date} className={styles.order}>
            <div className={styles.head}>
              <span className={styles.date}>{fmt(o.date)}</span>
              <span className={`${styles.status} ${styles[st.cls]}`}>
                {st.label}
              </span>
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
        );
      })}
    </div>
  );
}
