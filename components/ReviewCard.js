import styles from "./ReviewCard.module.css";

export default function ReviewCard({ review }) {
  const stars = Math.max(0, Math.min(5, Number(review.stars) || 0));
  return (
    <div className={styles.card}>
      <div className={styles.stars}>{"★".repeat(stars)}</div>
      <p className={styles.text}>{review.message || review.text}</p>
      <span className={styles.author}>{review.author}</span>
    </div>
  );
}
