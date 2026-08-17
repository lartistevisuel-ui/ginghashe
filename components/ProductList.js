import styles from "./ProductList.module.css";
import ProductCard from "./ProductCard";
import { products } from "../data/products";

export default function ProductList() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.star}>★</span> Best-sellers
        </h2>
        <button className={styles.seeAll} type="button">
          Tout voir →
        </button>
      </div>
      <div className={styles.carousel}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
