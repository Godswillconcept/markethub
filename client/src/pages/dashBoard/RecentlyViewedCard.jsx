import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { getImageUrl } from "../../utils/imageUtil.js";

function RecentlyViewedCard({ product }) {
  return (
    <div className="p-2">
      <div className="group relative block overflow-hidden rounded-lg shadow-sm">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Wishlist Button */}
        <button className="absolute top-2.5 right-2.5 z-10 rounded-full p-1.5 text-white hover:text-red-500">
          <FiHeart size={20} />
        </button>

        {/* Cart Button */}
        <button
          className={`absolute right-2.5 bottom-2.5 z-10 rounded-lg p-2.5 backdrop-blur-sm transition-colors ${
            product.inStock
              ? "bg-white/80 text-black hover:bg-white"
              : "cursor-not-allowed bg-gray-300 text-gray-600"
          }`}
          disabled={!product.inStock}
        >
          <FiShoppingCart size={18} />
        </button>

        {/* Stock Badge */}
        <span
          className={`absolute bottom-2.5 left-2.5 rounded-md px-2 py-1 text-xs font-medium ${
            product.inStock
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {product.inStock ? "Available Now" : "Out of Stock"}
        </span>
      </div>

      {/* Info Section */}
      <div className="mt-3 flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{product.category}</p>
          <p className="mt-0.5 font-medium text-neutral-800">{product.name}</p>
        </div>
        <p className="text-right font-semibold text-neutral-800">
          ${product.price}
        </p>
      </div>
    </div>
  );
}

export default RecentlyViewedCard;
