import Link from "next/link";
import styles from "./ProductList.module.css";
import ProductCard from "./ProductCard";

export default function ProductCarousel({
  title,
  icon = "★",
  seeAllLabel = "Tout voir →",
  seeAllHref = "/produits",
  products,
}) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.star}>{icon}</span> {title}
        </h2>
        <Link href={seeAllHref} className={styles.seeAll}>
          {seeAllLabel}
        </Link>
      </div>
      <div className={styles.carousel}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
