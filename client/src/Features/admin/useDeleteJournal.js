import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteJournal } from "../../services/apiAdminJournals.js";

export const useDeleteJournal = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (journalId) => {
            if (!journalId) {
                throw new Error("Journal ID is required for deletion");
            }
            return deleteJournal(journalId);
        },
        onSuccess: (data, journalId) => {
            console.log("Journal deleted successfully:", journalId);
            toast.success("Journal deleted successfully");

            // Invalidate journal queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ["journals"] });
            queryClient.invalidateQueries({ queryKey: ["admin-journal-detail", journalId] });
        },
        onError: (error) => {
            console.error("Delete journal error:", error);

            let errorMessage = "Failed to delete journal";
            if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        },
    });

    return mutation;
};
