// import { useState } from "react";

// export default function SearchFilters({ onFilterChange }) {
//     const [filters, setFilters] = useState({
//         priceRange: "",
//         brand: "",
//         sort: "",
//     });

//     function handleChange(e) {
//         const { name, value } = e.target;
//         const updated = { ...filters, [name]: value };
//         setFilters(updated);
//         onFilterChange(updated);
//     }

//     return (
//         <aside className="p-4 border rounded-md space-y-4">
//             <h2 className="font-semibold text-lg">Filters</h2>

//             <div>
//                 <label className="block mb-1 text-sm">Price Range</label>
//                 <select
//                     name="priceRange"
//                     onChange={handleChange}
//                     value={filters.priceRange}
//                     className="w-full border rounded-md p-2"
//                 >
//                     <option value="">All</option>
//                     <option value="0-50">$0 - $50</option>
//                     <option value="50-100">$50 - $100</option>
//                     <option value="100-200">$100 - $200</option>
//                     <option value="200+">$200+</option>
//                 </select>
//             </div>

//             <div>
//                 <label className="block mb-1 text-sm">Brand</label>
//                 <select
//                     name="brand"
//                     onChange={handleChange}
//                     value={filters.brand}
//                     className="w-full border rounded-md p-2"
//                 >
//                     <option value="">All</option>
//                     <option value="Nike">Nike</option>
//                     <option value="Adidas">Adidas</option>
//                     <option value="Zara">Zara</option>
//                 </select>
//             </div>

//             <div>
//                 <label className="block mb-1 text-sm">Sort By</label>
//                 <select
//                     name="sort"
//                     onChange={handleChange}
//                     value={filters.sort}
//                     className="w-full border rounded-md p-2"
//                 >
//                     <option value="">Default</option>
//                     <option value="price-asc">Price: Low to High</option>
//                     <option value="price-desc">Price: High to Low</option>
//                     <option value="newest">Newest</option>
//                 </select>
//             </div>
//         </aside>
//     );
// }

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function SearchFilters({ onFilterChange }) {
    const [filters, setFilters] = useState({
        priceRange: [0, 1000],
        brand: "",
        sort: "",
    });

    const [accordion, setAccordion] = useState({
        price: true,
        brand: true,
        sort: true,
    });

    const brands = ["Nike", "Adidas", "Zara", "H&M", "Gucci", "Puma"];

    function toggleAccordion(section) {
        setAccordion((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    }

    function handleChange(e) {
        const { name, value } = e.target;
        const updated = { ...filters, [name]: value };
        setFilters(updated);
        onFilterChange(updated);
    }

    function handlePriceChange(e, index) {
        const newRange = [...filters.priceRange];
        newRange[index] = Number(e.target.value);
        setFilters((prev) => ({ ...prev, priceRange: newRange }));
        onFilterChange({ ...filters, priceRange: newRange });
    }

    function clearFilters() {
        const reset = { priceRange: [0, 1000], brand: "", sort: "" };
        setFilters(reset);
        onFilterChange(reset);
    }

    const FilterSection = ({ title, isOpen, onToggle, children }) => (
        <div className="border-b border-gray-200 py-4">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between text-left"
            >
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
            </button>
            {isOpen && <div className="mt-4">{children}</div>}
        </div>
    );

    return (
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                >
                    Clear All
                </button>
            </div>

            {/* Price Range */}
            <FilterSection
                title="Price"
                isOpen={accordion.price}
                onToggle={() => toggleAccordion("price")}
            >
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        {/* <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filters.priceRange[0]}
                            onChange={(e) => handlePriceChange(e, 0)}
                            className="w-full accent-black"
                        /> */}
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            step="10"
                            value={filters.priceRange[1]}
                            onChange={(e) => handlePriceChange(e, 1)}
                            className="w-full accent-black"
                        />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>${filters.priceRange[0]}</span>
                        <span>${filters.priceRange[1]}</span>
                    </div>
                </div>
            </FilterSection>

            {/* Brand Filter */}
            <FilterSection
                title="Brand"
                isOpen={accordion.brand}
                onToggle={() => toggleAccordion("brand")}
            >
                <select
                    name="brand"
                    onChange={handleChange}
                    value={filters.brand}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:ring-black"
                >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                        <option key={brand} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>
            </FilterSection>

            {/* Sort Filter */}
            <FilterSection
                title="Sort By"
                isOpen={accordion.sort}
                onToggle={() => toggleAccordion("sort")}
            >
                <select
                    name="sort"
                    onChange={handleChange}
                    value={filters.sort}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-black focus:ring-black"
                >
                    <option value="">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                </select>
            </FilterSection>
        </aside>
    );
}

