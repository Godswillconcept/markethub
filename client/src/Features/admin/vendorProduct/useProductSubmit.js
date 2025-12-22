import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createProduct, updateProduct } from "../../../services/apiAdminProduct.js";

export const useProductSubmit = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ mode, productId, formData }) => {
            console.log("Mutation called with:", { mode, productId, hasFormData: !!formData });

            // Log FormData contents for debugging
            console.log("=== FormData Contents ===");
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: FILE - ${value.name} (${value.type}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }
            console.log("========================");

            if (mode === "create") {
                return createProduct(formData);
            } else if (mode === "edit") {
                // Validate productId exists for edit mode
                if (!productId) {
                    throw new Error("Product ID is required for updating a product");
                }
                return updateProduct(productId, formData);
            } else {
                throw new Error(`Invalid mode: ${mode}. Expected "create" or "edit"`);
            }
        },
        onSuccess: (data, variables) => {
            console.log("Mutation successful:", {
                mode: variables.mode,
                productId: variables.productId,
                response: data
            });

            // Show appropriate success message
            if (variables.mode === "edit") {
                toast.success("Product updated successfully");
                // Invalidate specific product query
                if (variables.productId) {
                    queryClient.invalidateQueries({ queryKey: ["product", variables.productId] });
                    queryClient.invalidateQueries({ queryKey: ["admin-product-detail", variables.productId] });
                }
            } else {
                toast.success("Product created successfully");
            }

            // Invalidate list queries
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: (error, variables) => {
            console.error("Mutation error:", {
                mode: variables.mode,
                productId: variables.productId,
                error: error.message,
                fullError: error,
            });

            // Extract and display error message
            let errorMessage = "An error occurred while saving the product";

            // Check for validation errors array
            if (error.error?.errors && Array.isArray(error.error.errors)) {
                const validationErrors = error.error.errors.map(e => e.message).join(", ");
                errorMessage = validationErrors;
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        },
    });

    return mutation;
};