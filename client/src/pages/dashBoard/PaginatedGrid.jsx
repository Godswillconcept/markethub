import { useState } from "react";
import { useNavigate } from "react-router-dom";

function PaginatedGrid({
  title = "Items",
  items = [],
  CardComponent,
  emptyTitle = "No items found",
  emptyDescription = "Try exploring our collection!",
  emptyRedirect = "/shop",
  emptyRedirectLabel = "Go to Shop",
  batchSize = 6,
}) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const navigate = useNavigate();

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
  };

  // Empty state
  if (!items || items.length === 0) {
    return (
      <section className="w-full py-12 text-center">
        <h2 className="mb-4 text-xl font-semibold text-neutral-800">
          {emptyTitle}
        </h2>
        <p className="mb-6 text-neutral-600">{emptyDescription}</p>
        <button
          onClick={() => navigate(emptyRedirect)}
          className="rounded-lg bg-neutral-800 px-6 py-2 font-medium text-white transition hover:bg-black"
        >
          {emptyRedirectLabel}
        </button>
      </section>
    );
  }

  return (
    <section className="w-full">
      {/* Title */}
      <h2 className="p-3.5 text-2xl font-bold tracking-widest text-neutral-800">
        {title}
      </h2>

      {/* Grid */}
      <div className="grid w-full grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        {items.slice(0, visibleCount).map((item) => (
          <CardComponent key={item.id} item={item} />
        ))}
      </div>

      {/* View More Button */}
      {visibleCount < items.length && (
        <div className="mt-8 text-center">
          <button
            onClick={handleViewMore}
            className="rounded-lg bg-neutral-800 px-6 py-2 font-medium text-white transition hover:bg-black"
          >
            View More
          </button>
        </div>
      )}
    </section>
  );
}

export default PaginatedGrid;
