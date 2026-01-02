import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtil.js";
function PendingReviewCard({ item }) {
  const navigate = useNavigate();
  const [rated, setRated] = useState(!!item.rated);

  return (
    <article
      tabIndex={0}
      aria-labelledby={`title-${item.id}`}
      className="flex items-start gap-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus:ring-2 focus:ring-orange-200 focus:outline-none"
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100 md:h-20 md:w-20">
        <img
          src={getImageUrl(item.image)}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdC<KEY>IjoibW9ub3NwYWNlIiBmb250LXNpemU9IjEwcHgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjYzFjNWNiIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";
          }}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h2
          id={`title-${item.id}`}
          className="truncate text-sm font-medium text-gray-900 md:text-base"
        >
          {item.title}
        </h2>
        <div className="mt-2 text-xs text-gray-600">
          Order n°: <span className="font-medium text-gray-800">{item.id}</span>
        </div>
        <div className="mt-1 text-xs text-green-600">
          Delivered on {item.delivered}
        </div>
      </div>

      {/* Action */}
      <div className="ml-3 flex items-start">
        {!rated ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`${item.product_id}`, {
                state: {
                  product: {
                    id: item.product_id, // Ensure we pass product ID
                    title: item.title,
                    image: item.image,
                  },
                  orderId: item.id, // Pass order ID if needed for context
                },
              });
              setRated(true);
            }}
            className="rounded px-2 py-1 text-sm text-orange-500 hover:underline focus:ring-2 focus:ring-orange-200 focus:outline-none"
            aria-label={`Rate product ${item.title}, order ${item.id}`}
          >
            Rate this product
          </button>
        ) : (
          <button disabled className="px-2 py-1 text-sm text-gray-400">
            Rated
          </button>
        )}
      </div>
    </article>
  );
}

export default PendingReviewCard;
