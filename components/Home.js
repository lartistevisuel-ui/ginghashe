import styles from "./Home.module.css";
import Marquee from "./Marquee";
import CategoryGrid from "./CategoryGrid";
import ProductList from "./ProductList";
import BottomNav from "./BottomNav";

export default function Home() {
  return (
    <main className={styles.home}>
      <header className={styles.hero}>
        <img src="/logo-banner.png" alt="KINGHASH 94" className={styles.heroLogo} />
      </header>
      <Marquee />
      <CategoryGrid />
      <ProductList />
      <BottomNav />
    </main>
  );
}
