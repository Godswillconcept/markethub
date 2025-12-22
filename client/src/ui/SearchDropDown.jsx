import { useEffect, useState, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { getImageUrl } from "../utils/imageUtil.js";

/**
 * Props
 * - visible: boolean
 * - query: string (debounced query)
 * - results: array of products (each product should have id, name, image/thumbnail, Category or category)
 * - isLoading: boolean
 * - onSelectProduct(product)
 * - onSearchTerm(query)
 * - onClose()
 * - maxItems (optional)
 * - className (optional) - for extra styling
 * - isMobile (optional) - toggles full-width behavior
 */
function SearchDropdown({
    visible,
    query,
    results = [],
    isLoading = false,
    onSelectProduct,
    onSearchTerm,
    onClose,
    maxItems = 6,
    className = "",
    isMobile = false,
}) {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef(null);

    // Reset focus when visible changes
    useEffect(() => {
        setFocusedIndex(-1);
    }, [visible, query, results]);

    // Close when clicking outside
    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose?.();
            }
        }
        if (visible) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [visible, onClose]);

    // Keyboard navigation (Up / Down / Enter / Esc)
    useEffect(() => {
        if (!visible) return;
        function onKey(e) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setFocusedIndex((i) => Math.min(i + 1, Math.min(results.length, maxItems) /* + search term */));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setFocusedIndex((i) => Math.max(i - 1, -1));
            } else if (e.key === "Enter") {
                if (focusedIndex === -1) {
                    // Enter on the search term
                    onSearchTerm?.(query);
                } else {
                    const product = results[focusedIndex];
                    if (product) onSelectProduct?.(product);
                }
            } else if (e.key === "Escape") {
                onClose?.();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [visible, results, focusedIndex, query, onSelectProduct, onSearchTerm, onClose, maxItems]);

    if (!visible) return null;

    return (
        <div
            ref={containerRef}
            role="listbox"
            aria-label="Search suggestions"
            className={`absolute top-full left-0 z-[60] mt-2 w-full max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg ${isMobile ? "left-0 right-0" : ""} ${className}`}
        >
            {isLoading ? (
                <p className="p-3 text-sm text-gray-500">Searching...</p>
            ) : (
                <>
                    <button
                        type="button"
                        role="option"
                        aria-selected={focusedIndex === -1}
                        onClick={() => onSearchTerm?.(query)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 ${focusedIndex === -1 ? "bg-gray-50" : ""}`}
                    >
                        <BiSearch className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-800">Search for <strong>{query}</strong></span>
                    </button>

                    <hr className="border-t border-gray-100" />

                    {results.length > 0 ? (
                        results.slice(0, maxItems).map((p, idx) => (
                            <button
                                key={p.id || `${p.name}-${idx}`}
                                type="button"
                                role="option"
                                aria-selected={focusedIndex === idx}
                                onClick={() => onSelectProduct?.(p)}
                                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-gray-100 ${focusedIndex === idx ? "bg-gray-50" : ""}`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {(p.image || p.thumbnail) ? (
                                        <img src={getImageUrl(p.image || p.thumbnail)} alt={p.name} className="h-8 w-8 flex-shrink-0 rounded object-cover" />
                                    ) : (
                                        <div className="h-8 w-8 flex-shrink-0 rounded bg-gray-100" />
                                    )}
                                    <span className="text-sm text-gray-800 truncate">{p.name}</span>
                                </div>

                                <div className="flex-shrink-0 pl-3">
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {p.Category?.name || p.category?.name || p.Category || p.category || ""}
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="p-3 text-sm text-gray-500">No products found</p>
                    )}
                </>
            )}
        </div>
    );

}

export default SearchDropdown;



// <div
//     ref={containerRef}
//     role="listbox"
//     aria-label="Search suggestions"
//     className={`z-50 mt-2 w-full rounded-md border border-gray-200 bg-white shadow-lg ${isMobile ? "left-0 right-0" : ""} ${className}`}
// >
//     {isLoading ? (
//         <p className="p-3 text-sm text-gray-500">Searching...</p>
//     ) : (
//         <>
//             {/* 1. Search for "term" row */}
//             <button
//                 type="button"
//                 role="option"
//                 aria-selected={focusedIndex === -1}
//                 onClick={() => onSearchTerm?.(query)}
//                 className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 ${focusedIndex === -1 ? "bg-gray-50" : ""}`}
//             >
//                 <BiSearch className="h-4 w-4 text-gray-400" />
//                 <span className="text-sm text-gray-800">Search for <strong>{query}</strong></span>
//             </button>

//             <hr className="border-t border-gray-100" />

//             {/* 2. Product suggestions */}
//             {results.length > 0 ? (
//                 results.slice(0, maxItems).map((p, idx) => (
//                     <button
//                         key={p.id || `${p.name}-${idx}`}
//                         type="button"
//                         role="option"
//                         aria-selected={focusedIndex === idx}
//                         onClick={() => onSelectProduct?.(p)}
//                         className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-gray-100 ${focusedIndex === idx ? "bg-gray-50" : ""}`}
//                     >
//                         <div className="flex items-center gap-3 min-w-0">
//                             {(p.image || p.thumbnail) ? (
//                                 <img
//                                     src={p.image || p.thumbnail}
//                                     alt={p.name}
//                                     className="h-8 w-8 flex-shrink-0 rounded object-cover"
//                                 />
//                             ) : (
//                                 <div className="h-8 w-8 flex-shrink-0 rounded bg-gray-100" />
//                             )}
//                             <span className="text-sm text-gray-800 truncate">{p.name}</span>
//                         </div>

//                         <div className="flex-shrink-0 pl-3">
//                             <span className="text-xs text-gray-500 whitespace-nowrap">
//                                 {p.Category?.name || p.category?.name || p.Category || p.category || ""}
//                             </span>
//                         </div>
//                     </button>
//                 ))
//             ) : (
//                 <p className="p-3 text-sm text-gray-500">No products found</p>
//             )}
//         </>
//     )}
// </div>
// SearchDropdown.jsx (only changed outer div here)