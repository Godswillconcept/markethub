// import axios from "axios";
// import axiosInstance from "./axios";


// // api endpoint for signup
// export async function register(credentials) {
//     try {
//         const { data } = await axiosInstance.post("/auth/register", credentials);
//         console.log(data);

//         return data;
//     }
//     catch (error) {
//         throw new Error(error.response?.data?.message || "Registration failed");
//     }

// }

// // api endpoint for verify email
// export async function verifyEmail(credentials) {
//     try {
//         const { data } = await axiosInstance.post("/auth/verify-email", credentials);
//         console.log(data);

//         return data;
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Verification failed");
//     }
// }


// // api endpoint for resend verification
// export async function resendVerification(email) {
//     try {
//         const { data } = await axiosInstance.post("/auth/resend-verification", { email });
//         return data;
//     }
//     catch (error) {
//         throw new Error(error.response?.data?.message || "Resend verification failed");
//     }
// }




// // api endpoint for login
// export async function login(credentials) {
//     try {
//         const { data } = await axiosInstance.post("/auth/login", credentials);
//         return data;
//     }
//     catch (error) {
//         throw new Error(error.response?.data?.message || "Login failed");
//     }
// }

// // api endpoint for get current user
// export async function currentUser() {
//     try {
//         const token = localStorage.getItem("token");
//         if (!token) throw new Error("No token found");

//         const { data } = await axiosInstance.get("/auth/me", {
//             headers: { Authorization: `Bearer ${token}` }
//         });
//         return data;
//     } catch (error) {
//         throw new Error(error.response?.data?.message || "Failed to get user profile");
//     }
// }

// export async function updateUser(credentials) {
//     try {
//         const token = localStorage.getItem("token");
//         console.log("🔑 Token exists:", !!token);

//         if (!token) throw new Error("No token found");

//         console.log("📤 Sending update with data:", credentials);

//         const { data } = await axiosInstance.put("/auth/me", credentials, {
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         console.log("✅ Update response:", data);
//         return data;
//     } catch (error) {
//         console.error("❌ Update error:", error.response?.data || error.message);
//         throw new Error(error.response?.data?.message || "Update user failed");
//     }
// }



// // api endpoint for logout
// export async function logout() {
//     try {
//         await axiosInstance.get("/auth/logout");
//     }
//     catch (error) {
//         throw new Error("Logout failed");
//     }
// }

// export async function updatePassword(credentials) {
//     try {
//         const { data } = await axiosInstance.patch("/auth/update-password", credentials);
//         return data;
//     }
//     catch (error) {
//         throw new Error(error.response?.data?.message || "Update password failed");
//     }
// }

// // api endpoint for forgot password
// export async function forgotPassword(credentials) {
//     try {
//         const { data } = await axiosInstance.post("/auth/forgot-password", credentials);
//         return data;
//     }
//     catch (error) {
//         throw new Error(error.response?.data?.message || "Forgot password failed");
//     }

// }

// export async function forgotPasswordReset(credentials) {
//     const { reset_token, ...rest } = credentials;
//     try {
//         const { data } = await axiosInstance.post(`/auth/reset-password/${reset_token}`, rest);
//         return data;
//     }
//     catch (error) {
//         throw new Error(error.response?.data?.message || "Reset password failed");
//     }
// }



import axiosInstance from "./axios.js";


// api endpoint for signup
export async function register(credentials) {
    try {
        const { data } = await axiosInstance.post("/auth/register", credentials);
        console.log("✅ Registration response:", data);
        return data;
    }
    catch (error) {
        throw new Error(error.response?.data?.message || "Registration failed");
    }
}

// api endpoint for verify email
export async function verifyEmail(credentials) {
    try {
        const { data } = await axiosInstance.post("/auth/verify-email", credentials);
        console.log("✅ Email verification response:", data);
        return data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Verification failed");
    }
}

// api endpoint for resend verification
export async function resendVerification(email) {
    try {
        const { data } = await axiosInstance.post("/auth/resend-verification", { email });
        return data;
    }
    catch (error) {
        throw new Error(error.response?.data?.message || "Resend verification failed");
    }
}

// api endpoint for login
export async function login(credentials) {
    try {
        const { data } = await axiosInstance.post("/auth/login", credentials);
        console.log("✅ Login response:", data);
        return data;
    }
    catch (error) {
        throw new Error(error.response?.data?.message || "Login failed");
    }
}

// api endpoint for get current user
export async function currentUser() {
    try {
        const token = localStorage.getItem("token");
        const sessionId = localStorage.getItem("session_id");
        console.log("🔑 currentUser: Token exists:", !!token, "Session ID exists:", !!sessionId);

        if (!token) {
            const error = new Error("No token found");
            error.isAuthError = true;
            throw error;
        }

        if (!sessionId) {
            console.warn("⚠️ currentUser: No session_id found, token refresh may fail");
        }

        console.log("🔄 currentUser: Making API request...");
        const { data } = await axiosInstance.get("/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
                // Add session_id header if available
                ...(sessionId && { "X-Session-Id": sessionId })
            }
        });

        console.log("📥 currentUser: Raw API response:", data);

        // Handle different response structures from your API
        // Some APIs return { user: {...} }, others return the user directly
        const userData = data.user || data.data || data;

        console.log("✅ currentUser: Extracted user data:", userData);

        // If we get an empty object, log a warning
        if (!userData || Object.keys(userData).length === 0) {
            console.warn("⚠️ currentUser: Received empty user data");
        }

        return userData;
    } catch (error) {
        console.error("❌ currentUser: API error:", error.response?.data || error.message);
        
        // Mark authentication errors for special handling
        if (error.response?.status === 401) {
            error.isAuthError = true;
        }
        
        throw new Error(error.response?.data?.message || "Failed to get user profile");
    }
}

// api endpoint for update user
export async function updateUser(credentials) {
    try {
        console.log("📤 Updating user with data:", credentials);

        const { data } = await axiosInstance.put("/auth/me", credentials);

        console.log("📥 Update user API response:", data);

        // Handle different response structures
        // Your API might return:
        // 1. { user: {...} } - wrapped in user property
        // 2. { data: {...} } - wrapped in data property
        // 3. { message: "...", user: {...} } - with message
        // 4. {...} - direct user object

        const userData = data.user || data.data || data;

        console.log("✅ Extracted user data:", userData);

        // If the API doesn't return complete user data, fetch it
        if (!userData || !userData.id) {
            console.warn("⚠️ Incomplete user data in response, fetching fresh data...");
            return await currentUser();
        }

        return userData;
    } catch (error) {
        console.error("❌ Update user API error:", error.response?.data || error);
        throw new Error(error.response?.data?.message || "Update user failed");
    }
}

// api endpoint for logout
export async function logout() {
    try {
        await axiosInstance.get("/auth/logout");
        console.log("✅ Logout successful");
    }
    catch (error) {
        throw new Error("Logout failed");
    }
}

export async function updatePassword(credentials) {
    try {
        const { data } = await axiosInstance.patch("/auth/update-password", credentials);
        console.log("✅ Password update response:", data);
        return data;
    }
    catch (error) {
        throw new Error(error.response?.data?.message || "Update password failed");
    }
}

// api endpoint for forgot password
export async function forgotPassword(credentials) {
    try {
        const { data } = await axiosInstance.post("/auth/forgot-password", credentials);
        return data;
    }
    catch (error) {
        throw new Error(error.response?.data?.message || "Forgot password failed");
    }
}

export async function forgotPasswordReset(credentials) {
    const { reset_token, ...rest } = credentials;
    try {
        const { data } = await axiosInstance.post(`/auth/reset-password/${reset_token}`, rest);
        return data;
    }
    catch (error) {
        throw new Error(error.response?.data?.message || "Reset password failed");
    }
}