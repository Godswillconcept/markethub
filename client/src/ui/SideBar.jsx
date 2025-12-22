import React, { useState } from "react";
import { X, ChevronDown, ChevronUp, Star } from "lucide-react";

const FilterComponent = ({ isOpen, onClose, isMobile = false }) => {
  // Filter state management
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Accordion states
  const [accordionStates, setAccordionStates] = useState({
    price: true,
    color: true,
    size: true,
    category: true,
    brand: true,
    rating: true,
  });

  // Sample data
  const colors = [
    { name: "Black", value: "#000000", count: 145 },
    { name: "White", value: "#FFFFFF", count: 132 },
    { name: "Red", value: "#EF4444", count: 89 },
    { name: "Blue", value: "#3B82F6", count: 76 },
    { name: "Green", value: "#10B981", count: 54 },
    { name: "Yellow", value: "#F59E0B", count: 43 },
    { name: "Purple", value: "#8B5CF6", count: 32 },
    { name: "Pink", value: "#EC4899", count: 28 },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const categories = [
    { name: "Shirts", count: 234 },
    { name: "T-Shirts", count: 189 },
    { name: "Jeans", count: 156 },
    { name: "Dresses", count: 143 },
    { name: "Shoes", count: 198 },
    { name: "Accessories", count: 87 },
  ];

  const brands = [
    { name: "Nike", count: 123 },
    { name: "Adidas", count: 98 },
    { name: "Zara", count: 87 },
    { name: "H&M", count: 76 },
    { name: "Uniqlo", count: 65 },
    { name: "Gucci", count: 34 },
    { name: "Prada", count: 28 },
    { name: "Louis Vuitton", count: 19 },
  ];

  // Toggle accordion
  const toggleAccordion = (section) => {
    setAccordionStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle color selection
  const handleColorChange = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
  };

  // Handle size selection
  const handleSizeChange = (size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  // Handle brand selection
  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRating(0);
    setInStockOnly(false);
  };

  // Filter Section Component
  const FilterSection = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => onToggle(title.toLowerCase())}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );

  // Star Rating Component
  const StarRating = ({ rating, onSelect }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onSelect(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-4 w-4 ${
              star <= rating ? "fill-current text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  // Filter Content
  const filterContent = (
    <div className="flex h-full flex-col border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {isMobile && (
          <button
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Scrollable Filter Content */}
      <div className="flex-1 space-y-0 overflow-y-auto p-4">
        {/* Categories */}
        <FilterSection
          title="Category"
          isOpen={accordionStates.category}
          onToggle={toggleAccordion}
        >
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category.name} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => handleCategoryChange(category.name)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-3 flex-1 text-sm text-gray-700">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({category.count})
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection
          title="Price"
          isOpen={accordionStates.price}
          onToggle={toggleAccordion}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) =>
                  setPriceRange([Number(e.target.value), priceRange[1]])
                }
                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                placeholder="Min"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], Number(e.target.value)])
                }
                className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span>$1000+</span>
            </div>
          </div>
        </FilterSection>

        {/* Colors */}
        <FilterSection
          title="Color"
          isOpen={accordionStates.color}
          onToggle={toggleAccordion}
        >
          <div className="grid grid-cols-4 gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                className={`relative h-8 w-8 rounded-full border-2 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none ${
                  selectedColors.includes(color.name)
                    ? "border-black ring-2 ring-black ring-offset-2"
                    : "border-gray-300"
                } ${color.value === "#FFFFFF" ? "border-gray-400" : ""}`}
                style={{ backgroundColor: color.value }}
                title={`${color.name} (${color.count})`}
              >
                {selectedColors.includes(color.name) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`h-2 w-2 rounded-full ${color.value === "#FFFFFF" || color.value === "#F59E0B" ? "bg-black" : "bg-white"}`}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Sizes */}
        <FilterSection
          title="Size"
          isOpen={accordionStates.size}
          onToggle={toggleAccordion}
        >
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  selectedSizes.includes(size)
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Brands */}
        <FilterSection
          title="Brand"
          isOpen={accordionStates.brand}
          onToggle={toggleAccordion}
        >
          <div className="max-h-48 space-y-3 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand.name} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.name)}
                  onChange={() => handleBrandChange(brand.name)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-3 flex-1 text-sm text-gray-700">
                  {brand.name}
                </span>
                <span className="text-xs text-gray-500">({brand.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Rating */}
        <FilterSection
          title="Rating"
          isOpen={accordionStates.rating}
          onToggle={toggleAccordion}
        >
          <div className="space-y-3">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating}
                  onChange={() => setSelectedRating(rating)}
                  className="text-black focus:ring-black"
                />
                <div className="ml-3 flex items-center space-x-2">
                  <StarRating rating={rating} onSelect={() => {}} />
                  <span className="text-sm text-gray-700">& Up</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Availability */}
        <div className="border-b border-gray-200 py-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="ml-3 text-sm text-gray-700">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="space-y-3">
          <button
            onClick={clearAllFilters}
            className="w-full py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-800"
          >
            Clear All Filters
          </button>
          {isMobile && (
            <button
              onClick={onClose}
              className="w-full rounded-md bg-black px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800"
            >
              Show 1,234 Results
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
            isOpen ? "opacity-50" : "pointer-events-none opacity-0"
          }`}
          onClick={onClose}
        />

        {/* Drawer */}
        <div
          className={`fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {filterContent}
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <div className="sticky top-16 h-[calc(100vh-4rem)] w-62 overflow-hidden border-gray-200 bg-white">
      {filterContent}
    </div>
  );
};

export default FilterComponent;
