import styles from "./Marquee.module.css";

const MESSAGE = "KINGHASH 94 👑 Livraison rapide 🚀 Nouveautés chaque semaine 🔥";

export default function Marquee() {
  return (
    <div className={styles.bar}>
      <div className={styles.label}>
        <span className={styles.labelIcon}>📢</span> INFOS
      </div>
      <div className={styles.marquee}>
        <div className={styles.track}>
          <span className={styles.item}>{MESSAGE}</span>
          <span className={styles.item}>{MESSAGE}</span>
          <span className={styles.item}>{MESSAGE}</span>
          <span className={styles.item}>{MESSAGE}</span>
        </div>
      </div>
    </div>
  );
}
