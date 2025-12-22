import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import RatingSummary from "./RatingSummary.jsx";
import ReviewFilters from "./ReviewFilters.jsx";
import ReviewCard from "./ReviewCard.jsx";
import Pagination from "../../ui/Pagination.jsx";

function ProductReviews({
  reviews = [],
  total = 0,
  averageRating = 0,
  ratingDistribution = [],
  isLoading = false,
}) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchParams] = useSearchParams();
  const currentPage = !searchParams.get("page")
    ? 1
    : Number(searchParams.get("page"));

  const [filters, setFilters] = useState({
    rating: [],
    sort: "newest",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      // Toggle rating logic
      if (key === "rating") {
        const ratings = prev.rating.includes(value)
          ? prev.rating.filter((r) => r !== value)
          : [...prev.rating, value];
        return { ...prev, rating: ratings };
      }
      return { ...prev, [key]: value };
    });
  };

  // Filter and Sort Logic
  const filteredReviews = reviews
    .filter((review) => {
      // Rating Filter
      if (
        filters.rating.length > 0 &&
        !filters.rating.includes(review.rating)
      ) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date_created || 0);
      const dateB = new Date(b.date_created || 0);
      if (filters.sort === "newest") return dateB - dateA;
      if (filters.sort === "oldest") return dateA - dateB;
      return 0;
    });

  if (isLoading) {
    return (
      <section className="py-12 text-center text-gray-500 lg:py-16">
        Loading reviews...
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <section className="py-12 text-center text-gray-500 lg:py-16">
        No reviews yet for this product.
      </section>
    );
  }

  return (
    <section id="reviews" className="py-12 lg:py-16">
      {/* --- RATING SUMMARY --- */}
      <RatingSummary
        averageRating={averageRating}
        ratingDistribution={ratingDistribution}
      />

      <div className="my-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
        {/* Left Column: Filters (Desktop) */}
        <aside className="hidden lg:block">
          <ReviewFilters
            onFilterChange={handleFilterChange}
            currentFilters={filters}
          />
        </aside>

        {/* Right Column: Review List */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">
              Review Lists ({filteredReviews.length})
            </h3>

            {/* Mobile Filter Trigger */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 text-sm font-semibold"
              >
                All reviews
                <span
                  className={`transition-transform ${showMobileFilters ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>
            </div>
          </div>

          {showMobileFilters && (
            <div className="border-ui-border mb-6 rounded-md border bg-gray-50 p-4 lg:hidden">
              <ReviewFilters
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </div>
          )}

          {/* --- Review Cards --- */}
          <div>
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          {total > 0 && (
            <div className="mt-8">
              <Pagination count={total} currentPage={currentPage} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ProductReviews;
