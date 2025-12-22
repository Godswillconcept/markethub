import { getImageUrl } from "../utils/imageUtil.js";

function WishlistCard({ product, onRemove, onAddToCart }) {
    return (
        <div className="w-full max-w-xs rounded-lg shadow-lg overflow-hidden bg-white">
            {/* Product Image */}
            <img
                src={getImageUrl(product.image)}
                alt={product.title}
                className="w-full h-72 object-cover"
            />

            {/* Product Info */}
            <div className="mt-3 flex items-start justify-between px-4 pb-3">
                <div>
                    <p className="text-sm text-neutral-500">{product.Category.name}</p>
                    <p className="mt-0.5 font-medium text-neutral-800">{product.title}</p>
                </div>
                <p className="text-right font-semibold text-neutral-800">
                    ${product.price}
                </p>
            </div>

            {/* Actions */}
            <div className="flex">
                <button
                    onClick={() => onRemove(product.id)}
                    className="w-1/2 py-3 text-black bg-white border border-black rounded-bl-lg font-medium hover:bg-gray-100 transition"
                >
                    Remove
                </button>
                <button
                    onClick={() => onAddToCart(product)}
                    className="w-1/2 py-3 text-white bg-black rounded-br-lg font-medium hover:bg-gray-900 transition"
                >
                    Add To Cart
                </button>
            </div>
        </div>
    );
}

export default WishlistCard;
