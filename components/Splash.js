"use client";

import { useEffect, useState } from "react";
import styles from "./Splash.module.css";

const VISIBLE_MS = 1800;
const FADE_MS = 500;

export default function Splash() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), VISIBLE_MS);
    const t2 = setTimeout(() => setGone(true), VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`${styles.splash} ${leaving ? styles.leaving : ""}`}>
      <img src="/hero.jpg" alt="KINGHASH 94" className={styles.logo} />
    </div>
  );
}
