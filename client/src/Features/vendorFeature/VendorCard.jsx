import { BsFillCheckCircleFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { getPlaceholder } from "../../utils/helper.js";
import { getImageUrl } from "../../utils/imageUtil.js";

function VendorCard({ vendor }) {
  // Safely destructure with defaults
  const safeVendor = vendor || {};
  const {
    id,
    vendorId = id, // Use vendorId if it exists, otherwise fall back to id
    slug,
    User,
    store,
  } = safeVendor;

  // Safely destructure User with defaults
  const { first_name = "", last_name = "", profile_image = null } = User || {};

  // Safely destructure store with defaults
  const { tagline = "" } = store || {};

  // Use store logo if available, otherwise user profile image, otherwise placeholder
  const imageUrl = getImageUrl(profile_image) || getPlaceholder(first_name, last_name);
  const displayName = `${first_name} ${last_name}`.trim() || "Vendor";



  return (
    <Link
      to={`/vendor/${vendorId}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/20 shadow-inner transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={displayName}
        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-64 lg:h-72"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = getPlaceholder(first_name, last_name);
        }}
      />

      {/* Frosted Glass Overlay */}
      <div className="absolute right-0 bottom-0 left-0 rounded-b-2xl bg-white/70 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="truncate text-lg font-bold text-gray-900">
            {displayName}
          </span>
          <BsFillCheckCircleFill
            className="flex-shrink-0 text-green-500"
            size={16}
          />
        </div>
        {tagline && (
          <p className="mt-1 truncate text-sm text-gray-700">{tagline}</p>
        )}
      </div>
    </Link>
  );
}

export default VendorCard;
