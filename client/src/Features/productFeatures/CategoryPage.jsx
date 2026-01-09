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

  const { products, pagination, category, isLoading, error } =
    useProductsByCategory(page);

  // Get category name from ID for display
  const getCategoryName = (id) => {
    const categories = {
      men: "Men",
      women: "Women",
      kids: "Kids",
    };
    return categories[id?.toLowerCase()] || id || "Category";
  };

  if (isLoading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
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
      </section>
    </>
  );
}

export default CategoryPage;
