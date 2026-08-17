import styles from "./CategoryGrid.module.css";
import { categories } from "../data/categories";
import CategoryIcon from "./CategoryIcon";

function GridIcon({ color }) {
  return (
    <span className={styles.iconGrid} style={{ "--icon-color": color }}>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default function CategoryGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <GridIcon color="var(--accent)" />
          Catégories
        </h2>
        <button className={styles.seeAll} type="button">
          Tout voir →
        </button>
      </div>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={styles.card}
            type="button"
            style={{ "--cat-color": cat.color }}
          >
            <span className={styles.iconChip}>
              <CategoryIcon id={cat.id} className={styles.catIcon} />
            </span>
            <span className={styles.label}>{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
