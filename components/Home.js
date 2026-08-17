import styles from "./Home.module.css";
import Marquee from "./Marquee";
import CategoryGrid from "./CategoryGrid";
import ProductCarousel from "./ProductCarousel";
import BottomNav from "./BottomNav";
import ScrollTopButton from "./ScrollTopButton";
import { StarIcon, SparkleIcon } from "./Icons";
import { products } from "../data/products";
import { newArrivals } from "../data/newArrivals";

export default function Home() {
  return (
    <main className={styles.home}>
      <header className={styles.hero}>
        <img src="/logo-banner.png" alt="KINGHASH 94" className={styles.heroLogo} />
      </header>
      <Marquee />
      <CategoryGrid />
      <ProductCarousel
        title="Best-sellers"
        icon={<StarIcon size={18} />}
        seeAllLabel="Tout voir →"
        products={products}
      />
      <ProductCarousel
        title="Nouveautés"
        icon={<SparkleIcon size={18} />}
        seeAllLabel="Tous les produits →"
        products={newArrivals}
      />
      <BottomNav />
      <ScrollTopButton />
    </main>
  );
}
