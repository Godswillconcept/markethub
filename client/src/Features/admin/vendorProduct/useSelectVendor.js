// useVendors.js
import { useQuery } from '@tanstack/react-query';
import { getAllVendorsInput } from '../../../services/apiAdminProduct.js';


export const useSelectVendor = (searchTerm = '') => {
    return useQuery({
        queryKey: ['vendorSearch', searchTerm],
        queryFn: async () => {
            // Pass search term to API for server-side filtering
            const data = await getAllVendorsInput(searchTerm);
            return data;
        },
        select: (data) => {
            // Transform to react-select format
            return data.map(vendor => ({
                value: vendor.id,
                label: vendor.store?.business_name || 'Unknown Vendor',
                vendor: vendor // Keep full vendor object if needed
            }));
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: true, // Always enabled, API handles minimum search length
    });
};