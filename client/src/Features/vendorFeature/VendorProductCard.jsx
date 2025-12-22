import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtil.js";

const VendorProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <div className="group overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Product Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status Badge */}
        {product.status === "Out of stock" && (
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
              Out of stock
            </span>
          </div>
        )}

        {/* Status overlay only */}
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/30 to-transparent p-4">
          {/* Empty div to maintain the gradient overlay */}
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="line-clamp-1 flex-1 pr-2 text-sm font-medium text-gray-900">
            {product.name}
          </h3>
          <div className="text-lg font-semibold whitespace-nowrap text-gray-800">
            {product.price}
          </div>
        </div>
        <p className="mb-3 text-xs text-gray-500">{product.category}</p>

        {/* Stats Row */}
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{product.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <ShoppingCart className="h-3 w-3" />
            <span>{product.sold} sold</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate(`/designer/product`)}
          // onClick={() => navigate(`/vendor/products/${product.id}`)}
          className="w-full rounded-md bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-100"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
export default VendorProductCard;
