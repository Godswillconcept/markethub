import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { useProductSearch } from "../Features/productFeatures/useSearchProduct.js";

const SearchBox = ({ className = "", onProductSelect, autoFocus = false, placeholder = "Search products..." }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Debounce query input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch products based on debounced query
  const { products: searchResults = [], isLoading: isFetching } = useProductSearch(debouncedQuery);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/product/${product.id}`); // Direct navigation to product page
    if (onProductSelect) onProductSelect();
  };

  const handleSearchSubmit = () => {
    if (!debouncedQuery) return;
    setShowDropdown(false);
    navigate(`/search?query=${debouncedQuery}`);
    if (onProductSelect) onProductSelect();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <BiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (query.length > 0) setShowDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full rounded-full border border-gray-300 bg-gray-50 py-2 pr-3 pl-10 text-sm leading-5 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:outline-none"
          autoFocus={autoFocus}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && query && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
           {/* Short query message */}
           {query.length < 3 && (
            <p className="p-3 text-sm text-gray-500 italic">
              Type at least 3 characters to search...
            </p>
          )}

          {/* Loading state - only if we have a valid query length */}
          {query.length >= 3 && isFetching && (
            <p className="p-3 text-sm text-gray-500">Searching...</p>
          )}

           {/* Results */}
          {query.length >= 3 && !isFetching && (
            <>
              {/* Search term suggestion/action */}
              <button
                onClick={handleSearchSubmit}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-50"
              >
                <BiSearch className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-800">
                  Search for "<strong>{query}</strong>"
                </span>
              </button>

              {/* Product List */}
              {searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto">
                {searchResults.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex w-full items-start gap-2">
                      {/* Optional: Add tiny thumbnail if available */}
                      {/* {product.thumbnail && <img src={product.thumbnail} className="w-8 h-8 rounded object-cover" />} */}
                      
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 break-words font-medium">
                          {product.name}
                        </p>
                         {product.Category && (
                          <p className="text-xs text-gray-500 truncate">
                            {product.Category.name?.split(" ")[0] || product.Category}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                </div>
              ) : (
                <p className="p-3 text-sm text-gray-500">No products found for "{query}"</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
