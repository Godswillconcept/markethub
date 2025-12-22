import axiosInstance from "./axios.js";

// getting all the product to be displayed
export async function getAdminProduct(page = 1, limit = 9, search) {
    try {
        const params = { page, limit };
        if (search && search.length >= 3) {
            params.search = search;
        }
        const { data } = await axiosInstance.get('/admin/products/all', {
            params
        });

        console.log("Admin product api", data);

        return {
            data: data.data,
            total: data.total,
            count: data.count
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get admin product");
    }
}

// getting a single product details

export async function getAdminProductAnalysis(productId) {
    try {
        const { data } = await axiosInstance.get(`/admin/products/${productId}/analytics`);

        console.log("Admin product detail api", data);

        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get product by id");
    }
}

export async function deleteProduct(productId) {
    try {
        await axiosInstance.delete(`/admin/products/${productId}`);

        console.log("Admin product detail api");

        return true;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to delete product");
    }
}

export async function getAllCategoriesInput(search = "") {
    try {
        const params = {};
        if (search && search.length >= 2) {
            params.search = search;
        }
        const { data } = await axiosInstance.get('/categories', { params });
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get categories");
    }
}

export async function getAllVendorsInput(search = "") {
    try {
        const params = {};
        if (search && search.length >= 2) {
            params.search = search;
        }
        const { data } = await axiosInstance.get('/vendors', { params });
        return data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get vendors");
    }
}

// export async function createProduct() {
//     try {
//         const { data } = await axiosInstance.post('/admin/products');

//         console.log("Admin product detail api", data);

//         return data.data;
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Failed to create product");
//     }
// }

// export async function updateProduct(productId) {
//     try {
//         const { data } = await axiosInstance.put(`/admin/products/${productId}`);

//         console.log("Admin product detail api", data);

//         return data.data;
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Failed to update product");
//     }
// }
export async function createProduct(formData) {
    const { data } = await axiosInstance.post('/admin/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}

export async function updateProduct(productId, formData) {
    const { data } = await axiosInstance.put(`/admin/products/${productId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}