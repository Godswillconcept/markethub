import Pagination from "../../ui/Pagination.jsx";
import { useFollowVendorList } from "../vendorFeature/useFollowVendorList.js";
import VendorCard from "../vendorFeature/VendorCard.jsx";

function FollowedDesigner() {
    const {
        followVendorList = [],
        isLoading,
        error,
        total = 0
    } = useFollowVendorList();

    // Transform the data to match VendorCard's expected format
    const formattedVendors = followVendorList?.map(item => {
        const vendor = item.vendor || {};
        const store = vendor.store || {};
        const user = vendor.User || {};

        return {
            id: vendor.id,
            User: {
                first_name: user.first_name,
                last_name: user.last_name,
                profile_image: store.logo || '/vendorImg/vendor-placeholder.png'
            },
            store: {
                tagline: vendor.join_reason || 'Fashion Designer'
            },
            slug: store.slug,
            totalSales: vendor.total_sales,
            status: vendor.status
        };
    }) || [];

    return (
        <div className="mx-auto min-h-screen max-w-[95%] overflow-hidden rounded-xl shadow-lg lg:p-8">
            <h2 className="mb-6 text-2xl font-bold">Followed Vendors</h2>

            {/* Grid of cards */}
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 p-4 md:grid-cols-3 xl:grid-cols-3">
                {formattedVendors.map((vendor) => (
                    <VendorCard
                        key={vendor.id}
                        vendor={vendor}
                    />
                ))}
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full" />
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="mt-8 flex justify-center">
                    <p className="text-center text-lg font-bold">
                        Error loading vendors: {error.message}
                    </p>
                </div>
            )}

            {/* No results state */}
            {!isLoading && formattedVendors.length === 0 && (
                <div className="mt-8 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl font-semibold">You're not following any vendors yet</h3>
                    <p className="mt-2 text-gray-600">Discover talented vendors and follow them to see their work here!</p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => window.location.href = '/vendors'}
                    >
                        Browse Vendors
                    </button>
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && total > 0 && (
                <div className="mt-8">
                    <Pagination count={total} />
                </div>
            )}
        </div>
    );
}

export default FollowedDesigner;
