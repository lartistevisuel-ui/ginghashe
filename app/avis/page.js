import Page from "../../components/Page";
import ReviewsSection from "../../components/ReviewsSection";

export const metadata = { title: "Avis — KINGHASH 94" };

export default function AvisPage() {
  return (
    <Page title="Avis clients" subtitle="Ce que pensent nos clients">
      <ReviewsSection />
    </Page>
  );
}
