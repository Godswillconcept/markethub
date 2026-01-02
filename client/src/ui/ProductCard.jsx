import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAddWishList } from "../Features/productFeatures/useAddWishList.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useUnifiedCart } from "../Features/cart/useUnifiedCart.js";
import { memo } from "react";
import { getImageUrl } from "../utils/imageUtil.js";

const ProductCard = memo(function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useUnifiedCart();
  console.log("ProductCard props:", product);
  // const inStock = true;
  const {
    id,
    name,
    thumbnail,
    price,
    Category,
    category, // Add lowercase category for compatibility
    inStock = true,
  } = product;
  
  const categoryName = (Category?.name || category?.name) || "Uncategorized";
  console.log('[ProductCard] Product thumbnail from API:', thumbnail);
  console.log('[ProductCard] Product ID:', id);
  const { addToWishList, isAddingToWishList } = useAddWishList();
  // function handleAddToWishList() {
  //   console.log("adding");

  //   addToWishList(id);
  // }
  function handleAddToWishList(e) {
    e.stopPropagation(); // Prevent click from bubbling to parent
    console.log("adding");

    addToWishList(id);
  }

  function handleAddToCart(e) {
    e.stopPropagation();
    addToCart(id, 1, product);
  }

  return (
    <div className="p-2">
      <div
        className="group relative block overflow-hidden rounded-lg shadow-sm"
        onClick={() => navigate(`/products/${product.slug}`)}
      >
        {/* Image */}
        <div className="aspect-[3/4] w-full overflow-hidden">
          <img
            src={getImageUrl(thumbnail) || "https://picsum.photos/400/300"}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Wishlist Button */}
        <button
          disabled={isAddingToWishList}
          className="absolute top-2.5 right-2.5 z-10 rounded-full bg-white/70 p-1.5 text-gray-800 shadow-md backdrop-blur-md transition hover:bg-white hover:text-red-500"
          onClick={handleAddToWishList}
        >
          {!isAddingToWishList ? <FiHeart size={20} /> : "Adding... "}
        </button>

        {/* Cart Button */}
        <button
          className={`absolute right-2.5 bottom-2.5 z-10 rounded-full p-2.5 shadow-md backdrop-blur-md transition-colors ${
            inStock
              ? "bg-white/70 text-black hover:bg-white"
              : "cursor-not-allowed bg-gray-300 text-gray-600"
          }`}
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <FiShoppingCart size={18} />
        </button>

        {/* Stock Badge */}
        {(inStock === 0 || inStock === null) && inStock !== true && (
          <span
            className={`absolute bottom-2.5 left-2.5 rounded-md px-2 py-1 text-xs font-medium shadow-sm ${
              inStock
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{categoryName}</p>
          <p className="mt-0.5 font-medium text-neutral-800">{name}</p>
        </div>
        <p className="text-right font-semibold text-neutral-800">
          {formatCurrency(price)}
        </p>
      </div>
    </div>
  );
});

export default ProductCard;
