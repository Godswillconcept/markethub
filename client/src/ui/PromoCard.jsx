import { ShoppingCart, Clock } from "lucide-react";
import { getImageUrl } from "../utils/imageUtil.js";
const PromoCard = ({ product }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm">
    <div className="relative">
      <img
        src={getImageUrl(product.imageUrl)}
        alt={product.title}
        className="aspect-[1/1] h-auto w-full rounded-lg object-cover"
      />
      <span
        className="absolute top-0 left-0 bg-red-500 px-4 py-2 text-xs font-bold text-white"
        style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)" }}
      >
        50% Sales
      </span>
      <div className="absolute right-2 bottom-2">
        <button className="rounded-full bg-white p-3 shadow-md hover:bg-gray-100">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm text-gray-500">{product.category}</p>
      <div className="flex items-center justify-between">
        <h3 className="text-md mt-1 font-semibold text-gray-900">
          {product.title}
        </h3>
        <p className="mt-1 text-lg font-bold text-gray-900">${product.price}</p>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <Clock className="h-4 w-4" />
        <span>05Days : 10Hrs : 20min : 50Sec</span>
      </div>
    </div>
  </div>
);
export default PromoCard;
