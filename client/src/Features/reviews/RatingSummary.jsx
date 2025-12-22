import StarRating from "./StarRating.jsx";
import { Star } from "lucide-react";

const RatingSummary = ({ averageRating, ratingDistribution }) => {
  return (
    <>
      <h3 className="mb-4 text-3xl font-bold">Product Reviews</h3>
      <div className="rounded-md border-2 border-dashed border-neutral-200 bg-gray-50 p-6">
        <div className="mb-8 flex flex-col items-start gap-6 md:flex-row lg:flex-row">
          {/* Overall Rating Circle */}
          <div className="flex flex-row items-center gap-4">
            <div className="relative h-20 w-20 flex-shrink-0">
              <svg
                className="h-20 w-20 -rotate-90 transform"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="90, 100"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <StarRating rating={averageRating} size="w-3 h-3" />
              <p className="mt-1 text-xs text-gray-500">from 125k reviews</p>
            </div>
          </div>

          {/* Rating Bars */}
          <div className="flex-1">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="mb-2 flex items-center gap-3">
                <div className="flex w-8 items-center gap-1">
                  <span className="text-sm text-gray-600">{item.stars}.0</span>
                  <Star className="h-3 w-3 fill-current text-orange-400" />
                </div>
                <div className="h-2 min-w-[200px] flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gray-800 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm text-gray-600">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RatingSummary;
