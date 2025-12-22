import { useParams, useSearchParams } from "react-router";
import { useProductsByCategory } from "./useProductByCategory.js";
import ProductSet from "../../ui/ProductSet.jsx";
import Pagination from "../../ui/Pagination.jsx";
import JournalCard from "../journalsFeature/JournalCard.jsx";
import { useBlogs } from "../journalsFeature/useBlogs.js";

function CategoryPage({ showAllProducts = false }) {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { blogs = {} } = useBlogs();

  const { products, pagination, category, isLoading, error } = useProductsByCategory(page);

  // Get category name from ID for display
  const getCategoryName = (id) => {
    const categories = {
      'men': 'Men',
      'women': 'Women',
      'kids': 'Kids'
    };
    return categories[id?.toLowerCase()] || id || 'Category';
  };

  if (isLoading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full" />
    </div>
  );

  if (error) return <p className="text-center text-red-500">{error.message}</p>;

  return (
    <>
      <section>
        {/* Products Section */}
        <section>
          <h1 className="mb-5 text-center text-2xl font-bold">
            {getCategoryName(categoryId).toUpperCase()}
          </h1>
          <ProductSet products={products} title="" columns={4} />
          <Pagination count={pagination?.total || 0} />
        </section>

        {/* Journals Section */}
        <section className="m-4 mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-neutral-800">Journals</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blogs?.slice(0, 3)?.map((journal) => (
              <JournalCard key={journal.id} journal={journal} />
            ))}
          </div>
        </section>
      </section>
    </>
  );
}

export default CategoryPage;
