import RecentlyViewedCard from "./RecentlyViewedCard.jsx";
import PaginatedGrid from "./PaginatedGrid.jsx";
import ProductCard from "../../ui/ProductCard.jsx";
import { useRecentlyViewed } from "../../Features/dashboardFeature/useRecentlyViewed.js";

function RecentPage() {
  const { recentlyViewed, isLoading, isError } = useRecentlyViewed()
  console.log("recently viewed", recentlyViewed);

  // Handle loading state
  if (isLoading) {
    return (
      <section className="w-full py-12 text-center">
        <h2 className="mb-4 text-2xl font-bold tracking-widest text-neutral-800">
          Recently Viewed
        </h2>
        <p className="text-neutral-600">Loading recently viewed products...</p>
      </section>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <section className="w-full py-12 text-center">
        <h2 className="mb-4 text-2xl font-bold tracking-widest text-neutral-800">
          Recently Viewed
        </h2>
        <p className="mb-6 text-neutral-600">
          Failed to load recently viewed products. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-neutral-800 px-6 py-2 font-medium text-white transition hover:bg-black"
        >
          Retry
        </button>
      </section>
    );
  }

  // Handle empty state
  if (!recentlyViewed || recentlyViewed.length === 0) {
    return (
      <section className="w-full py-12 text-center">
        <h2 className="mb-4 text-xl font-semibold text-neutral-800">
          You haven’t viewed any products yet
        </h2>
        <p className="mb-6 text-neutral-600">
          Browse our collection to find something you like!
        </p>
        <button
          onClick={() => window.location.href = "/shop"}
          className="rounded-lg bg-neutral-800 px-6 py-2 font-medium text-white transition hover:bg-black"
        >
          Go to Shop
        </button>
      </section>
    );
  }
  return (
    <PaginatedGrid
      title="Recently Viewed"
      products={recentlyViewed}
      CardComponent={ProductCard}
      // CardComponent={RecentlyViewedCard}
      emptyTitle="You haven’t viewed any products yet"
      emptyDescription="Browse our collection to find something you like!"
      emptyRedirect="/shop"
      emptyRedirectLabel="Go to Shop"
    />
  );
}

export default RecentPage;

// ...more products
// function RecentPage() {
//   return (
//     <ProductSet title="Recently Viewed" products={recentlyViewedProducts} />
//   );
// }

// export default RecentPage;
