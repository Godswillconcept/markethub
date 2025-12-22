
import axiosInstance from "./axios.js";


// api endpoint for update user
// export async function updateUser(credentials) {
//     try {
//         const { data } = await axiosInstance.patch("/auth/update-user", credentials);
//         return data;
//     }
//     catch (error) {
//         throw new Error("Update user failed");
//     }
// }

// export async function getOrders(page = 1, limit = 10) {
//     console.log("hellooooo");

//     try {
//         const { data } = await axiosInstance.get(`/orders/my-orders?page=${page}&limit=${limit}`);
//         console.log("order data", data);

//         return data;
//     }
//     catch (error) {
//         throw new Error("Get orders failed");
//     }
// }
export async function getOrders(page = 1, limit = 10, status = undefined) {
    console.log("Fetching orders with:", { page, limit, status });

    try {
        // Build query params
        let url = `/orders/my-orders?page=${page}&limit=${limit}`;

        // Add status filter if provided
        if (status) {
            url += `&status=${status}`;
        }

        const { data } = await axiosInstance.get(url);
        console.log("Order data api:", data);

        return data;
    } catch (error) {
        console.error("Get orders failed:", error);
        throw new Error("Get orders failed");
    }
}

export async function updateOrderStatus(orderId) {
    try {
        const { data } = await axiosInstance.get(`/orders/${orderId}`);
        console.log("Order status updated:", data);
        return data;
    } catch (error) {
        console.error("Update order status failed:", error);
        throw new Error("Update order status failed");
    }
}
// } export async function getOrders(page = 1, limit = 10, status = undefined) {
//     console.log("Fetching orders with:", { page, limit, status });

//     try {
//         // Build query params
//         let url = `/orders/my-orders?page=${page}&limit=${limit}`;

//         // Add status filter if provided
//         if (status) {
//             url += `&status=${status}`;
//         }

//         const { data } = await axiosInstance.get(url);
//         console.log("Order data:", data);

//         return data;
//     } catch (error) {
//         console.error("Get orders failed:", error);
//         throw new Error("Get orders failed");
//     }
// }