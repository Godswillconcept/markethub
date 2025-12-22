import { useQuery } from "@tanstack/react-query";
import { getVendors } from "../../services/apiVendors.js";
import { getRandomVendor } from "../../utils/helper.js";

/**
 * Hook to get a random vendor that changes daily
 * @returns {Object} { vendor, isLoading, error }
 */
export function useDailyVendor() {
  // First, fetch all vendors
  const {
    data: allVendorsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allVendors"],
    queryFn: () => getVendors({ page: 1, limit: 1000 }), // Adjust limit as needed
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Extract vendors from the response
  const allVendors = allVendorsResponse?.data || [];

  // Get today's random vendor
  const dailyVendor = getRandomVendor(allVendors);

  return {
    dailyVendor,
    isLoading,
    error,
  };
}
