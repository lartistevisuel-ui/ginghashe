import styles from "./Marquee.module.css";
import { MegaphoneIcon } from "./Icons";

const MESSAGE = "KINGHASH 94 — Livraison rapide — Nouveautés chaque semaine";

export default function Marquee() {
  return (
    <div className={styles.bar}>
      <div className={styles.label}>
        <MegaphoneIcon className={styles.labelIcon} size={15} /> INFOS
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
