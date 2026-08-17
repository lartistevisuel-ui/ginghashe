import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={product.image} alt={product.name} className={styles.image} />

        <div className={styles.badges}>
          {product.postal && (
            <span className={`${styles.badge} ${styles.postal}`}>📮 POSTAL</span>
          )}
          {product.meetup && (
            <span className={`${styles.badge} ${styles.meetup}`}>📍 MEET-UP</span>
          )}
        </div>

        <button className={styles.fav} type="button" aria-label="Favori">
          ★
        </button>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          {product.prefix} {product.name} {product.suffix}
        </h3>
        <span className={styles.grade}>{product.grade}</span>
        <p className={styles.description}>{product.description}</p>

        <button className={styles.variant} type="button">
          <span>{product.variant}</span>
          <span className={styles.chevron}>▾</span>
        </button>

        <div className={styles.priceRow}>
          <span className={styles.weight}>{product.weight}</span>
          <span className={styles.price}>{product.price}</span>
        </div>

        <button className={styles.cta} type="button">
          VOIR LE PRODUIT
        </button>
      </div>
    </article>
  );
}
