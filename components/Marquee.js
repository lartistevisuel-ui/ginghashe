"use client";

import { useEffect, useState } from "react";
import styles from "./Marquee.module.css";
import { MegaphoneIcon } from "./Icons";

const DEFAULT = "KINGHASH 94 — Livraison rapide — Nouveautés chaque semaine";

export default function Marquee() {
  const [message, setMessage] = useState(DEFAULT);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((s) => {
        if (s && typeof s.marquee_text === "string" && s.marquee_text.trim())
          setMessage(s.marquee_text);
      })
      .catch(() => {});
  }, []);

  return (
    <div className={styles.bar}>
      <div className={styles.label}>
        <MegaphoneIcon className={styles.labelIcon} size={15} /> INFOS
      </div>
      <div className={styles.marquee}>
        <div className={styles.track}>
          <span className={styles.item}>{message}</span>
          <span className={styles.item}>{message}</span>
          <span className={styles.item}>{message}</span>
          <span className={styles.item}>{message}</span>
        </div>
      </div>
    </div>
  );
}
