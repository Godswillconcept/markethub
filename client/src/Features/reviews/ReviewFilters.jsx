import { useState } from "react";
import ReviewGroup from "./ReviewGroup.jsx";
import ReviewCheckbox from "./ReviewCheckbox.jsx";
import StarIcon from "../../icons/StarIcon.jsx";

// Mock data, in a real application this would come from props or an API

// Mock data/Constants
const ratings = [5, 4, 3, 2, 1];
const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
];

const ReviewFilter = ({ onFilterChange, currentFilters }) => {
  const handleRatingChange = (rating) => {
    onFilterChange("rating", rating);
  };

  const handleSortChange = (e) => {
    onFilterChange("sort", e.target.value);
  };

  return (
    <div className="w-full max-w-xs rounded-lg border-2 border-dashed border-neutral-200 p-6 font-sans text-white">
      <h2 className="mb-2 text-xl font-semibold text-black">Reviews Filter</h2>
      <hr className="border-t-2 border-dashed border-neutral-200" />

      <ReviewGroup title="Rating">
        {ratings.map((rating) => (
          <ReviewCheckbox
            key={rating}
            id={`rating-${rating}`}
            checked={currentFilters?.rating?.includes(rating)}
            onChange={() => handleRatingChange(rating)}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 shrink-0 text-orange-400" />
              <span className="ml-2 font-medium">{rating}</span>
            </div>
          </ReviewCheckbox>
        ))}
      </ReviewGroup>

      <hr className="border-t-2 border-dashed border-neutral-200" />

      <div className="mt-4">
        <h3 className="mb-2 text-lg font-medium text-black">Sort By Date</h3>
        <select
          value={currentFilters?.sort || "newest"}
          onChange={handleSortChange}
          className="w-full rounded border border-gray-300 p-2 text-black"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ReviewFilter;
