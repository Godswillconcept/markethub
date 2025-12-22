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
    refetchOnWindowFocus: false, // 👈 This stops the refetch
    staleTime: 5 * 60 * 1000, // 👈 Data stays fresh for 5 minutes
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
