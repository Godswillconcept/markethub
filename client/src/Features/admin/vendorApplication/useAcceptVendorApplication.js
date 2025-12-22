import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptVendorApplicationStatus } from "../../../services/apiVendorApplication.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useAcceptVendorApplication() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: acceptApplication, isLoading: isAccepting } = useMutation({
    mutationFn: ({ vendorId }) =>
      acceptVendorApplicationStatus(vendorId, "approved"),
    onSuccess: (data, { vendorId }) => {
      // Invalidate and refetch the applications list
      queryClient.invalidateQueries(["vendor-applications"]);
      // Invalidate the specific application
      queryClient.invalidateQueries(["applicant", vendorId]);

      toast.success("Vendor application approved successfully");
      // Navigate back to the applications list
      navigate("/admin/applications");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve application");
    },
  });

  return { acceptApplication, isAccepting };
}
