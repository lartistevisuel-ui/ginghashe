import styles from "./Home.module.css";
import Marquee from "./Marquee";
import CategoryGrid from "./CategoryGrid";
import ProductCarousel from "./ProductCarousel";
import ReviewsCarousel from "./ReviewsCarousel";
import { StarIcon, SparkleIcon } from "./Icons";
import { products as staticBest } from "../data/products";
import { newArrivals as staticNew } from "../data/newArrivals";

export default function Home({ bestSellers = staticBest, nouveautes = staticNew }) {
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
        seeAllHref="/produits?section=best"
        products={bestSellers}
      />
      <ReviewsCarousel />
      <ProductCarousel
        title="Nouveautés"
        icon={<SparkleIcon size={18} />}
        seeAllLabel="Tout voir →"
        seeAllHref="/produits?section=new"
        products={nouveautes}
      />
    </main>
  );
}
