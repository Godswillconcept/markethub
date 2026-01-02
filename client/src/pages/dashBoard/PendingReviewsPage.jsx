import { useQuery } from "@tanstack/react-query";
import PendingReviewCard from "./PendingReviewCard.jsx";
import { getPendingReviews } from "../../services/apiReview";
import Spinner from "../../ui/Spinner.jsx";

function PendingReviewsPage() {
  const {
    data: pendingReviews,
    isLoading,
  } = useQuery({
    queryKey: ["pendingReviews"],
    queryFn: () => getPendingReviews(),
  });

  if (isLoading) return <Spinner />;

  // Sort reviews by delivery date (newest first)
  const reviews = pendingReviews?.data || [];

  return (
    <section className="">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">
          Pending Reviews{" "}
          <span className="text-base font-normal text-gray-500">
            ({reviews.length})
          </span>
        </h1>
      </header>

      {reviews.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-lg font-medium text-gray-900">
            No pending reviews
          </p>
          <p className="mt-1 text-sm text-gray-500">
            You have reviewed all your delivered products. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((item) => (
            <PendingReviewCard key={item.product_id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PendingReviewsPage;
