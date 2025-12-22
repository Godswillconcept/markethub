import { useMutation } from "@tanstack/react-query";
import { submitVendorApplication } from "../../services/apiVendorForm.js";

export function useSubmitVendorApplication() {
  return useMutation({
    mutationFn: submitVendorApplication,
  });
}
