
import { useSearchParams } from "react-router-dom";
import { useProductSearch } from "../../Features/productFeatures/useSearchProduct.js";
import ProductSet from "../../ui/ProductSet.jsx";
import Pagination from "../../ui/Pagination.jsx";

function SearchMain() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";
    const page = Number(searchParams.get("page")) || 1;

    const { products, pagination, isLoading, error } = useProductSearch(query, page);

    if (isLoading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full" />
        </div>
    );

    if (error) return <p className="text-center text-red-500">{error.message}</p>;

    return (
        <section className="max-w-6xl mx-auto p-6">
            <h1 className="text-xl font-bold mb-4">Search results for "{query}"</h1>
            <ProductSet products={products} title="" columns={4} />
            {pagination?.total > 0 && (
                <div className="mt-8">
                    <Pagination count={pagination?.total || 0} />
                </div>
            )}
        </section>
    );
}

export default SearchMain;
