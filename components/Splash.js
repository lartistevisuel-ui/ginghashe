"use client";

import styles from "./Splash.module.css";

export default function Splash({ isLeaving }) {
  return (
    <div className={`${styles.splash} ${isLeaving ? styles.leaving : ""}`}>
      <img
        src="/hero.jpg"
        alt="KINGHASH 94"
        className={styles.logo}
      />
    </div>
  );
}
