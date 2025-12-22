import StarIcon from "../../icons/StarIcon.jsx";

const StarRating = ({ rating = 0 }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={starValue}
            className={`h-5 w-5 ${rating >= starValue ? "text-amber-500" : "text-gray-300"
              }`}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
