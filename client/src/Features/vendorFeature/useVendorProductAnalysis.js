import { useUser } from '../authentication/useUser.js';
import { useQuery } from '@tanstack/react-query';
import { getAdminProductAnalysis } from '../../services/apiAdminProduct.js';
import { getProductAnalysis } from '../../services/apiProduct.js';

export default function useVendorProductAnalysis(productId) {
    const { user } = useUser();
    const isAdmin = user?.roles?.some(role => role.name === 'admin');
    const queryFn = isAdmin ? () => getAdminProductAnalysis(productId) : () => getProductAnalysis(productId);

    const { data, ...rest } = useQuery({
        queryKey: ['productAnalysis', productId],
        queryFn,
        enabled: productId && productId !== 'undefined',
    });

    return { data: data || {}, ...rest };
}