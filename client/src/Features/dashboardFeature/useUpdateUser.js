// // useUpdateUser.js - Enhanced mutation with better cache handling
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { updateUser as updateUserApi } from "../../services/apiAuth";
// import toast from "react-hot-toast";

// export function useUpdateUser() {
//     const queryClient = useQueryClient();

//     const { mutate: updateUser, isPending: isUpdating } = useMutation({
//         mutationFn: updateUserApi,
//         onSuccess: (data) => {
//             console.log("✅ Mutation success, received data:", data);

//             toast.success("User updated successfully");

//             // Option 1: Update cache directly with new data
//             queryClient.setQueryData(["user"], data);

//             // Option 2: Also invalidate to refetch (belt and suspenders approach)
//             queryClient.invalidateQueries({ queryKey: ["user"] });

//             console.log("🔄 Cache invalidated");
//         },
//         onError: (error) => {
//             console.error("❌ Mutation error:", error);
//             toast.error(error.message || "Failed to update user");
//         }
//     });

//     return { updateUser, isUpdating };
// }

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { updateUser as updateUserApi } from "../../services/apiAuth";
// import toast from "react-hot-toast";
// import { updateUserLocalStorage } from "../authentication/useUser";

// export function useUpdateUser() {
//     const queryClient = useQueryClient();

//     const { mutate: updateUser, isPending: isUpdating } = useMutation({
//         mutationFn: updateUserApi,
//         onSuccess: async (data) => {
//             console.log("📥 API Response:", data);

//             // Get the existing user data from cache
//             const existingUser = queryClient.getQueryData(["user"]);
//             console.log("📦 Existing user data:", existingUser);

//             // Merge the update response with existing user data
//             // This ensures we don't lose any fields that weren't in the update response
//             const mergedUserData = {
//                 ...existingUser,
//                 ...data,
//             };

//             console.log("🔄 Merged user data:", mergedUserData);

//             // 1. Update localStorage with merged data
//             const updatedUser = updateUserLocalStorage(mergedUserData);

//             // 2. Update React Query cache immediately with merged data
//             if (updatedUser) {
//                 queryClient.setQueryData(["user"], updatedUser);
//                 console.log("✅ Cache updated with:", updatedUser);
//             }

//             // 3. Refetch user data from server to ensure we have the latest
//             // This will fetch complete user data including any server-side computed fields
//             await queryClient.refetchQueries({
//                 queryKey: ["user"],
//                 type: 'active'
//             });

//             console.log("🔄 Refetched user data from server");

//             // 4. Show success message
//             toast.success("Profile updated successfully");

//             console.log("✅ User update completed successfully");
//         },
//         onError: (error) => {
//             console.error("❌ Error updating user:", error);
//             toast.error(error.message || "Failed to update profile");
//         }
//     });

//     return { updateUser, isUpdating };
// }
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser as updateUserApi } from "../../services/apiAuth.js";
import toast from "react-hot-toast";

export function useUpdateUser() {
    const queryClient = useQueryClient();

    const { mutate: updateUser, isPending: isUpdating } = useMutation({
        mutationFn: updateUserApi,
        onMutate: async (newUserData) => {
            // Cancel outgoing refetches to prevent overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: ["currentUser"] });

            // Snapshot the previous value
            const previousUser = queryClient.getQueryData(["currentUser"]);

            // Optimistically update the cache
            // Preserve existing profile_image if not being updated
            const optimisticUpdate = {
                ...previousUser,
                ...newUserData,
                // If profile_image is not in newUserData, keep the existing one
                profile_image: newUserData.profile_image || previousUser?.profile_image
            };

            queryClient.setQueryData(["currentUser"], optimisticUpdate);

            // Return context with previous value
            return { previousUser };
        },
        onSuccess: (data) => {
            console.log("✅ Update successful, API response:", data);

            // Get the complete user data from cache
            const currentCache = queryClient.getQueryData(["currentUser"]);

            // Merge API response with current cache to ensure we don't lose any fields
            // Most importantly, preserve the profile_image if the API doesn't return it
            const mergedData = {
                ...currentCache,
                ...data,
                // If the API response doesn't include profile_image, keep the existing one
                profile_image: data.profile_image || currentCache?.profile_image
            };

            console.log("📦 Merged user data:", mergedData);

            // Update React Query cache with merged data
            queryClient.setQueryData(["currentUser"], mergedData);

            toast.success("Profile updated successfully");
        },
        onError: (error, context) => {
            console.error("❌ Update failed:", error);

            // Rollback to previous value on error
            if (context?.previousUser) {
                queryClient.setQueryData(["currentUser"], context.previousUser);
            }

            toast.error(error.message || "Failed to update profile");
        },
        onSettled: () => {
            // Always refetch after error or success to ensure cache is in sync
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        },
    });

    return { updateUser, isUpdating };
}