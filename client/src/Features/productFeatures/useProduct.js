import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../../services/apiProduct.js";


export function useProduct() {
  const { slug } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductById(slug),
    enabled: !!slug,
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes - product details are stable
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    product: data?.data || {},
    isLoading,
    error,
  };
}

// export function useProduct() {
//   const { productId } = useParams(); // read productId from the route

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["product", productId],
//     queryFn: () => getProductById(productId),
//     enabled: !!productId, // only fetch when we have an id
//     retry: false, // fail fast if not found
//   });

//   return {
//     product: data?.data || {},
//     isLoading,
//     error,
//   };
// }
