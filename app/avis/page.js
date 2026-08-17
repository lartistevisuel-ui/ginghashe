import Page from "../../components/Page";
import ReviewCard from "../../components/ReviewCard";
import ui from "../../components/UI.module.css";
import { reviews } from "../../data/reviews";

export const metadata = { title: "Avis — KINGHASH 94" };

export default function AvisPage() {
  return (
    <Page title="Avis clients" subtitle="Ce que pensent nos clients">
      <div className={ui.stack}>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </Page>
  );
}
