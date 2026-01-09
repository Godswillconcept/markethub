import { useQuery } from "@tanstack/react-query";
import { getJournalById } from "../../services/apiAdminJournals.js";

export function useJournalDetail(journalId, mode) {
    const {
        data: journalData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["admin-journal-detail", journalId],
        queryFn: () => getJournalById(journalId),
        enabled: mode === "edit" && !!journalId,
        staleTime: 1000 * 60, // 1 minute
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    console.log("Admin journal detail", journalData);

    return {
        journalData: journalData?.data || {},
        isLoading,
        isError,
        error,
    };
}
