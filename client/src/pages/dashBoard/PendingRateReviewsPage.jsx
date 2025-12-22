import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Star } from "lucide-react"; // or use heroicons if preferred
import { getImageUrl } from "../../utils/imageUtil.js";

export default function PendingRateReviewsPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { product } = location.state || {};
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [review, setReview] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      orderId,
      rating,
      title,
      name,
      review,
    };

    console.log("Submit review:", payload);

    navigate(-1);
  };

  return (
    <div className="mx-auto max-w-4xl rounded-md border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="mb-6 text-xl font-semibold">Rate & Review</h1>

      <p className="mb-3 text-sm font-medium">
        SELECT THE STARS TO RATE THE PRODUCT
      </p>
      <div className="mb-6 flex items-center gap-4">
        <img
          src={
            getImageUrl(product?.image) ||
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMHB4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2MxYzVjYiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+"
          }
          alt={product?.title || "Product"}
          className="h-20 w-20 rounded-md border object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxMHB4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2MxYzVjYiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
          }}
        />
        <div>
          <h2 className="text-sm font-medium text-gray-800 md:text-base">
            {product?.title || "Product Title Not Available"}
          </h2>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                className={`h-6 w-6 cursor-pointer ${star <= rating ? "fill-orange-500 text-orange-500" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm font-medium">LEAVE A REVIEW</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-gray-600">Review Title</label>
            <input
              type="text"
              placeholder="e.g. I like it! / I don't like it!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Your name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600">Detailed Review</label>
          <textarea
            placeholder="Tell us more about your rating!"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="mt-1 h-32 w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-orange-500 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
          disabled={rating === 0}
        >
          Submit your review
        </button>
      </form>
    </div>
  );
}
