import Link from "next/link";
import styles from "./CategoryGrid.module.css";
import { categories as staticCategories } from "../data/categories";
import { getCategoriesFromDB } from "../lib/products-db";
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

export default async function CategoryGrid() {
  const db = await getCategoriesFromDB();
  const categories = db && db.length ? db : staticCategories;

  if (!categories.length) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <GridIcon color="var(--accent)" />
          Catégories
        </h2>
      </div>
      <div className={styles.grid}>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorie/${cat.id}`}
            className={styles.card}
            style={{ "--cat-color": cat.color }}
          >
            <span className={styles.iconChip}>
              <CategoryIcon id={cat.icon || cat.id} className={styles.catIcon} />
            </span>
            <span className={styles.label}>{cat.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
