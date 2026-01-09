import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createJournal, updateJournal } from "../../services/apiAdminJournals.js";

export const useJournalSubmit = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ mode, journalId, formData }) => {
            console.log("Mutation called with:", { mode, journalId, hasFormData: !!formData });

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
                return createJournal(formData);
            } else if (mode === "edit") {
                if (!journalId) {
                    throw new Error("Journal ID is required for updating a journal");
                }
                return updateJournal(journalId, formData);
            } else {
                throw new Error(`Invalid mode: ${mode}. Expected "create" or "edit"`);
            }
        },
        onSuccess: (data, variables) => {
            console.log("Mutation successful:", {
                mode: variables.mode,
                journalId: variables.journalId,
                response: data
            });

            // Show appropriate success message
            if (variables.mode === "edit") {
                toast.success("Journal updated successfully");
                if (variables.journalId) {
                    queryClient.invalidateQueries({ queryKey: ["journal", variables.journalId] });
                    queryClient.invalidateQueries({ queryKey: ["admin-journal-detail", variables.journalId] });
                }
            } else {
                toast.success("Journal created successfully");
            }

            // Invalidate list queries
            queryClient.invalidateQueries({ queryKey: ["journals"] });
        },
        onError: (error, variables) => {
            console.error("Mutation error:", {
                mode: variables.mode,
                journalId: variables.journalId,
                error: error.message,
                fullError: error,
            });

            let errorMessage = "An error occurred while saving the journal";

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
