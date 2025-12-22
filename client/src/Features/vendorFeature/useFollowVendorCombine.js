// import { useMutation, useQueryClient } from "@tanstack/react-query";
// // import { followVendor, unfollowVendor } from "../../services/apiVendor";
// import toast from "react-hot-toast";
// import { followVendor, unfollowVendor } from "../../services/apiVendors";


// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { followVendor, unfollowVendor } from "../../services/apiVendors";

// export function useFollowVendorCombine() {
//     const queryClient = useQueryClient();

//     const followMutation = useMutation({
//         mutationFn: followVendor,
//         onMutate: async (vendorId) => {
//             console.log('🔵 FOLLOW - onMutate started for:', vendorId);

//             // Cancel all followedVendors queries (all pages)
//             await queryClient.cancelQueries({ queryKey: ["followedVendors"] });

//             // Get all the cached pages
//             const previousData = queryClient.getQueriesData({ queryKey: ["followedVendors"] });

//             // Optimistically update ALL pages in cache
//             queryClient.setQueriesData({ queryKey: ["followedVendors"] }, (oldData) => {
//                 if (!oldData) return oldData;

//                 // Check if vendor already exists in this page
//                 const exists = oldData.data?.some(v => v.vendor_id === vendorId);
//                 if (exists) return oldData;

//                 // Add to the first page
//                 return {
//                     ...oldData,
//                     data: oldData.data ? [{ vendor_id: vendorId }, ...oldData.data] : [{ vendor_id: vendorId }],
//                 };
//             });

//             return { previousData };
//         },
//         onError: (err, vendorId, context) => {
//             console.log('🔴 FOLLOW - Error:', err.message);

//             // Restore all previous pages
//             if (context?.previousData) {
//                 context.previousData.forEach(([queryKey, data]) => {
//                     queryClient.setQueryData(queryKey, data);
//                 });
//             }

//             toast.error(err.message || "Failed to follow vendor");
//         },
//         onSuccess: () => {
//             console.log('✅ FOLLOW - Success');
//             toast.success("Vendor followed successfully!");
//         },
//         onSettled: () => {
//             console.log('🔵 FOLLOW - Settled, invalidating all pages');
//             // Invalidate all pages to refetch from server
//             queryClient.invalidateQueries({ queryKey: ["followedVendors"] });
//         },
//     });

//     const unfollowMutation = useMutation({
//         mutationFn: unfollowVendor,
//         onMutate: async (vendorId) => {
//             console.log('🟡 UNFOLLOW - onMutate started for:', vendorId);

//             await queryClient.cancelQueries({ queryKey: ["followedVendors"] });
//             const previousData = queryClient.getQueriesData({ queryKey: ["followedVendors"] });

//             // Remove vendor from ALL cached pages
//             queryClient.setQueriesData({ queryKey: ["followedVendors"] }, (oldData) => {
//                 if (!oldData || !oldData.data) return oldData;

//                 return {
//                     ...oldData,
//                     data: oldData.data.filter(v => v.vendor_id !== vendorId),
//                 };
//             });

//             return { previousData };
//         },
//         onError: (err, vendorId, context) => {
//             console.log('🔴 UNFOLLOW - Error:', err.message);

//             if (context?.previousData) {
//                 context.previousData.forEach(([queryKey, data]) => {
//                     queryClient.setQueryData(queryKey, data);
//                 });
//             }

//             toast.error(err.message || "Failed to unfollow vendor");
//         },
//         onSuccess: () => {
//             console.log('✅ UNFOLLOW - Success');
//             toast.success("Vendor unfollowed successfully!");
//         },
//         onSettled: () => {
//             console.log('🟡 UNFOLLOW - Settled, invalidating all pages');
//             queryClient.invalidateQueries({ queryKey: ["followedVendors"] });
//         },
//     });

//     const toggleFollow = (vendorId, isFollowing) => {
//         console.log('🎯 toggleFollow called:', { vendorId, isFollowing });
//         if (isFollowing) {
//             unfollowMutation.mutate(vendorId);
//         } else {
//             followMutation.mutate(vendorId);
//         }
//     };

//     return {
//         followVendor: followMutation.mutate,
//         unfollowVendor: unfollowMutation.mutate,
//         toggleFollow,
//         isFollowing: followMutation.isPending || unfollowMutation.isPending,
//     };
// }






// export function useFollowVendorCombine() {
//     const queryClient = useQueryClient();

//     const followMutation = useMutation({
//         mutationFn: followVendor,
//         onMutate: async (vendorId) => {
//             // Cancel outgoing refetches
//             await queryClient.cancelQueries({ queryKey: ["followedVendors"] });

//             // Snapshot the previous value
//             const previousVendors = queryClient.getQueryData(["followedVendors"]);

//             // Optimistically update to the new value
//             queryClient.setQueryData(["followedVendors"], (old) => {
//                 if (!old) return new Set([vendorId]);
//                 return new Set([...old, vendorId]);
//             });

//             return { previousVendors };
//         },
//         onError: (err, vendorId, context) => {
//             // Rollback on error
//             queryClient.setQueryData(["followedVendors"], context.previousVendors);
//             toast.error(err.message || "Failed to follow vendor");
//         },
//         onSuccess: () => {
//             toast.success("Vendor followed successfully!");
//         },
//         onSettled: () => {
//             // Refetch after mutation
//             queryClient.invalidateQueries({ queryKey: ["followedVendors"], exact: true });
//         },
//     });

//     const unfollowMutation = useMutation({
//         mutationFn: unfollowVendor,
//         onMutate: async (vendorId) => {
//             await queryClient.cancelQueries({ queryKey: ["followedVendors"] });
//             const previousVendors = queryClient.getQueryData(["followedVendors"]);

//             queryClient.setQueryData(["followedVendors"], (old) => {
//                 if (!old) return new Set();
//                 const newSet = new Set(old);
//                 newSet.delete(vendorId);
//                 return newSet;
//             });

//             return { previousVendors };
//         },
//         onError: (err, vendorId, context) => {
//             queryClient.setQueryData(["followedVendors"], context.previousVendors);
//             toast.error(err.message || "Failed to unfollow vendor");
//         },
//         onSuccess: () => {
//             toast.success("Vendor unfollowed successfully!");
//         },
//         onSettled: () => {
//             queryClient.invalidateQueries({ queryKey: ["followedVendors"], exact: true });
//         },
//     });

//     const toggleFollow = (vendorId, isFollowing) => {
//         if (isFollowing) {
//             unfollowMutation.mutate(vendorId);
//         } else {
//             followMutation.mutate(vendorId);
//         }
//     };

//     return {
//         followVendor: followMutation.mutate,
//         unfollowVendor: unfollowMutation.mutate,
//         toggleFollow,
//         isFollowing: followMutation.isPending || unfollowMutation.isPending,
//     };
// }

// export function useFollowVendorCombine() {
//     const queryClient = useQueryClient();

//     const followMutation = useMutation({
//         mutationFn: followVendor,
//         onSuccess: () => {
//             queryClient.invalidateQueries(["followedVendors"]);
//             toast.success("Vendor followed successfully!");
//         },
//         onError: (error) => {
//             toast.error(error.message || "Failed to follow vendor");
//         },
//     });

//     const unfollowMutation = useMutation({
//         mutationFn: unfollowVendor,
//         onSuccess: () => {
//             queryClient.invalidateQueries(["followedVendors"]);
//             toast.success("Vendor unfollowed successfully!");
//         },
//         onError: (error) => {
//             toast.error(error.message || "Failed to unfollow vendor");
//         },
//     });

//     const toggleFollow = (vendorId, isFollowing) => {
//         if (isFollowing) {
//             unfollowMutation.mutate(vendorId);
//         } else {
//             followMutation.mutate(vendorId);
//         }
//     };

//     return {
//         followVendor: followMutation.mutate,
//         unfollowVendor: unfollowMutation.mutate,
//         toggleFollow,
//         isFollowing: followMutation.isPending || unfollowMutation.isPending,
//     };
// }

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followVendor as followVendorApi, unfollowVendor as unfollowVendorApi } from "../../services/apiVendors.js";
import toast from "react-hot-toast";

export const useFollowVendorCombine = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: toggleFollow, isPending: isFollowing } = useMutation({
        mutationFn: async ({ vendorId, isCurrentlyFollowed }) => {
            if (isCurrentlyFollowed) {
                return await unfollowVendorApi(vendorId);
            } else {
                return await followVendorApi(vendorId);
            }
        },
        onSuccess: (data, variables) => {
            const { isCurrentlyFollowed } = variables;

            // Show appropriate success message
            if (isCurrentlyFollowed) {
                toast.success('Vendor unfollowed successfully');
            } else {
                toast.success('Vendor followed successfully');
            }

            // Invalidate all pages of the followed vendors list
            queryClient.invalidateQueries({
                queryKey: ["followedVendors"],
                refetchType: 'all' // Refetch all pages
            });
        },
        onError: (error, variables) => {
            const { isCurrentlyFollowed } = variables;

            // Show appropriate error message
            if (isCurrentlyFollowed) {
                toast.error('Failed to unfollow vendor');
            } else {
                toast.error('Failed to follow vendor');
            }

            console.error('Follow/Unfollow error:', error);
        },
    });

    // Wrapper function to simplify the API
    const handleToggleFollow = async (vendorId, isCurrentlyFollowed) => {
        return await toggleFollow({ vendorId, isCurrentlyFollowed });
    };

    return {
        toggleFollow: handleToggleFollow,
        isFollowing,
    };
};