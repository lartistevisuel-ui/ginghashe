import styles from "./ReviewCard.module.css";

export default function ReviewCard({ review }) {
  return (
    <div className={styles.card}>
      <div className={styles.stars}>{"★".repeat(review.stars)}</div>
      <p className={styles.text}>{review.text}</p>
      <span className={styles.author}>{review.author}</span>
    </div>
  );
}
