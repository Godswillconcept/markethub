import { useQuery } from '@tanstack/react-query';
import { getAllCategoriesInput } from '../../../services/apiAdminProduct.js';


export const useSelectCategory = (searchTerm = '') => {
    return useQuery({
        queryKey: ['categories', searchTerm],
        queryFn: async () => {
            // Pass search term to API for server-side filtering
            const data = await getAllCategoriesInput(searchTerm);

            // Flatten categories to include children
            const flattenedCategories = [];

            data.forEach(category => {
                if (category.children && category.children.length > 0) {
                    // Add all children
                    category.children.forEach(child => {
                        flattenedCategories.push({
                            id: child.id,
                            name: child.name,
                            slug: child.slug,
                            parent: category.name
                        });
                    });
                } else {
                    // Add parent if no children
                    flattenedCategories.push({
                        id: category.id,
                        name: category.name,
                        slug: category.slug,
                        parent: null
                    });
                }
            });

            // Client-side filter as fallback if API doesn't filter
            if (searchTerm && searchTerm.length >= 2) {
                return flattenedCategories.filter(cat =>
                    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            return flattenedCategories;
        },
        select: (data) => {
            // Transform to react-select format
            return data.map(category => ({
                value: category.id,
                label: category.parent
                    ? `${category.parent} > ${category.name}`
                    : category.name,
                category: category // Keep full category object if needed
            }));
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: true,
    });
};