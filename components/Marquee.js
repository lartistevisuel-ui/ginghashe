"use client";

import { useEffect, useState } from "react";
import styles from "./Marquee.module.css";
import { MegaphoneIcon } from "./Icons";

const DEFAULT = "KINGHASH 94 — Livraison rapide — Nouveautés chaque semaine";

function Group({ message, hidden }) {
  return (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      <span className={styles.item}>{message}</span>
      <span className={styles.item}>{message}</span>
      <span className={styles.item}>{message}</span>
    </div>
  );
}

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
        <Group message={message} />
        <Group message={message} hidden />
      </div>
    </div>
  );
}
