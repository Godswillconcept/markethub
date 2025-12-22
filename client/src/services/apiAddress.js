import axiosInstance from "./axios.js";

// api endpoint for get addresses
export async function getAddresses() {
    try {
        const { data } = await axiosInstance.get("/addresses");

        // Return the data array from the response
        return data.data;
    } catch (error) {

        throw new Error(error.response?.data?.message || "Failed to get addresses");
    }
}

// api endpoint for get address by id
export async function getAddressById(id) {
    try {
        const { data } = await axiosInstance.get(`/addresses/${id}`);

        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get address by id");
    }
}

// api endpoint for creating address
export async function createNewAddress(addressData) {
    try {
        const { data } = await axiosInstance.post("/addresses", addressData);

        // Return the data array from the response
        return data;
    } catch (error) {

        throw new Error(error.response?.data?.message || "Failed to create new address");
    }
}

// api endpoint for deleting address
export async function deleteAddress(id) {
    try {
        const { data } = await axiosInstance.delete(`/addresses/${id}`);


        // Return the data array from the response
        return data;
    } catch (error) {

        throw new Error(error.response?.data?.message || "Failed to delete address");
    }
}

// api endpoint for setting default address
export async function setDefaultAddress(id) {
    try {
        const { data } = await axiosInstance.patch(`/addresses/${id}/default`);


        // Return the data array from the response
        return data;
    } catch (error) {

        throw new Error(error.response?.data?.message || "Failed to set default address");
    }
}

// api endpoint for updating address
export async function updateAddress(id, addressData) {
    try {
        const { data } = await axiosInstance.put(`/addresses/${id}`, addressData);

        // Return the data array from the response
        return data;
    } catch (error) {

        throw new Error(error.response?.data?.message || "Failed to update address");
    }
}