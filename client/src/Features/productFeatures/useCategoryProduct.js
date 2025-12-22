// hooks/useCategoryProducts.js
import { useQuery } from "@tanstack/react-query";
import { getProductsByCategory } from "../../services/apiProduct.js";
import { useSearchParams } from "react-router-dom";
import { useParams } from "react-router-dom";

export function useCategoryProducts() {
    const { categoryId } = useParams();
    const [searchParams] = useSearchParams();
    const page = Number(searchParams.get("page")) || 1;

    console.log("useCategoryProducts called", { categoryId, page });

    const query = useQuery({
        queryKey: ["products_category", categoryId, page],
        queryFn: () => {
            console.log("QueryFn about to call API");
            return getProductsByCategory(categoryId, page);
        },
        enabled: !!categoryId, // ✅ makes sure categoryId is valid
        keepPreviousData: true,
    });

    console.log("From useCategoryProducts", query.data);

    return query;
}
