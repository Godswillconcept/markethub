// import StarRating from "./StarRating";

// import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

// // import ThumbsDownIcon from './icons/ThumbsDownIcon'; // Assuming this is created

// const ReviewCard = ({ review }) => {
//   const { author, avatar, date, rating, comment } = review;

//   return (
//     <div className="border-ui-border border-b py-6">
//       <div className="flex items-start gap-4">
//         {/* Avatar */}
//         <img
//           src={avatar}
//           alt={author}
//           className="h-12 w-12 rounded-full object-cover"
//         />

//         {/* Review Content */}
//         <div className="flex-1">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="font-bold">{author}</p>
//               <p className="text-text-secondary text-xs">
//                 {new Date(date).toLocaleDateString()}
//               </p>
//             </div>
//             <StarRating rating={rating} />
//           </div>
//           <p className="text-text-secondary mt-4 leading-relaxed">{comment}</p>
//         </div>

//         {/* Action Buttons (The Missing Part) */}
//         <div className="flex flex-col gap-2 lg:flex-row">
//           <button className="border-ui-border hover:text-text-primary rounded-md border p-2 text-gray-500 transition-colors hover:bg-gray-100">
//             <ThumbsUpIcon className="h-5 w-5" />
//           </button>
//           <button className="border-ui-border hover:text-text-primary rounded-md border p-2 text-gray-500 transition-colors hover:bg-gray-100">
//             <ThumbsDownIcon className="h-5 w-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReviewCard;
import { getPlaceholder } from "../../utils/helper.js";
import StarRating from "./StarRating.jsx";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { getImageUrl } from "../../utils/imageUtil.js";

const ReviewCard = ({ review }) => {
  // Safely extract info from API structure
  const {
    user,
    rating = 0,
    comment = "",
    created_at,
  } = review || {};

  const author = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "Anonymous";

  // const avatar = `https://i.pravatar.cc/48?u=${User?.id || Math.random()}`; // Placeholder avatar
  const date = created_at ? new Date(created_at).toLocaleDateString() : "Unknown date";

  return (
    <div className="border-ui-border border-b py-6">
      <div className="flex items-start gap-4">
        {/* --- Avatar --- */}
        <img
          src={getImageUrl(user.profile_image) || getPlaceholder(user.first_name, user.last_name)}
          alt={author}
          className="h-12 w-12 rounded-full object-cover"
        />

        {/* --- Review Content --- */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{author}</p>
              <p className="text-text-secondary text-xs">{date}</p>
            </div>
            <StarRating rating={rating} />
          </div>

          <p className="text-text-secondary mt-4 leading-relaxed">{comment}</p>
        </div>

        {/* --- Action Buttons (Optional UI) --- */}
        <div className="flex flex-col gap-2 lg:flex-row">
          <button className="border-ui-border hover:text-text-primary rounded-md border p-2 text-gray-500 transition-colors hover:bg-gray-100">
            <ThumbsUpIcon className="h-5 w-5" />
          </button>
          <button className="border-ui-border hover:text-text-primary rounded-md border p-2 text-gray-500 transition-colors hover:bg-gray-100">
            <ThumbsDownIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
