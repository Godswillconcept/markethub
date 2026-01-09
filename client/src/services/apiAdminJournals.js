import { PAGE_SIZE } from "../utils/constants";
import axiosInstance from "./axios";

export async function getJournals({ page, limit = PAGE_SIZE, search }) {
    try {
        const { data } = await axiosInstance.get("/journals", {
            params: { page, limit, search },
        });

        // Transform backend response structure
        const transformedData = {
            data: data.data,
            total: data.total,
            count: data.count
        };

        return transformedData;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to get journals",
        );
    }
}

// Get single journal by ID
export async function getJournalById(id) {
    try {
        const { data } = await axiosInstance.get(`/journals/${id}`);
        return data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to get journal details",
        );
    }
}

// Create new journal
export async function createJournal(formData) {
    try {
        const { data } = await axiosInstance.post('/admin/journals', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to create journal",
        );
    }
}

// Update existing journal
export async function updateJournal(id, formData) {
    try {
        const { data } = await axiosInstance.put(`/admin/journals/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to update journal",
        );
    }
}

// Delete journal
export async function deleteJournal(id) {
    try {
        const { data } = await axiosInstance.delete(`/admin/journals/${id}`);
        return data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to delete journal",
        );
    }
}
