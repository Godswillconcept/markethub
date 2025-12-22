import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVendorApplicationById } from "../../../services/apiVendorApplication.js";
import { useParams } from "react-router-dom";

export function useApplicantDetails() {
  const queryClient = useQueryClient();
  const { id } = useParams();

  // console.log("Route ID from useParams:", id);

  const {
    isLoading,
    data: applicant,
    error,
  } = useQuery({
    queryKey: ["applicant", id],
    queryFn: async () => {
      // console.log("QueryFn triggered with ID:", id);
      const res = await getVendorApplicationById(id);
      // console.log("QueryFn raw result:", res);
      return res;
    },
    enabled: !!id,
    keepPreviousData: true,
    onSuccess: (data) => {
      // console.log("Full API response:", data);
      queryClient.setQueryData(["applicant", id], data);
    },
    onError: (err) => {
      console.error("Query error:", err); // Catches API/network errors
    },
  });
  // console.log(applicant);
  return { applicant, isLoading, error };
}
