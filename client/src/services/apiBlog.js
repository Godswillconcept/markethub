import { PAGE_SIZE } from "../utils/constants.js";
import axiosInstance from "./axios.js";

// export async function getBlogs({ page }) {
//     try {
//         const { data } = await axiosInstance.get("/journals", {
//             params: { page, limit: PAGE_SIZE },
//         });

//         return { data: data.data, total: data.total };
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Failed to get blogs");
//     }
// }


export async function getBlogs({ page }) {
    try {
        const { data } = await axiosInstance.get("/journals", {
            params: { page, limit: PAGE_SIZE },
        });

        const items = data.data || [];

        // Normalize all blogs
        const blogs = items.map((blog) => ({
            ...blog,
            featured_images: JSON.parse(blog.featured_images || "[]"),
            date: new Date(blog.created_at).toLocaleDateString(),
        }));

        return {
            blogs,
            total: data.pagination?.total || 0,
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get blogs");
    }
}


export async function getBlogById(id) {
    try {
        const { data } = await axiosInstance.get(`/journals/${id}`);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get blog by id");
    }
}