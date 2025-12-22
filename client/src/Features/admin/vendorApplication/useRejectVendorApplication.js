import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectVendorApplication } from "../../../services/apiVendorApplication.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useRejectVendorApplication() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: rejectApplication, isLoading: isRejecting } = useMutation({
    mutationFn: ({ vendorId, reason }) =>
      rejectVendorApplication(vendorId, reason),
    onSuccess: (data, { vendorId }) => {
      // Invalidate and refetch the applications list
      queryClient.invalidateQueries(["vendor-applications"]);
      // Invalidate the specific application
      queryClient.invalidateQueries(["applicant", vendorId]);

      toast.success("Vendor application rejected successfully");
      // Navigate back to the applications list
      navigate("/admin/applications");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject application");
    },
  });

  return { rejectApplication, isRejecting };
}
