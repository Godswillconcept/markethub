import { useDailyVendor } from "./useDailyVendor.js";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtil.js";

function RandomVendor() {
  const { dailyVendor, isLoading, error } = useDailyVendor();
  console.log("vendor", dailyVendor);

  if (isLoading) {
    return (
      <div className="mx-auto hidden w-full px-4 py-10 lg:block">
        <div className="flex h-60 items-center justify-center">
          <div className="border-accent h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !dailyVendor) {
    return (
      <div className="mx-auto hidden w-full px-4 py-10 text-center lg:block">
        <p className="text-red-500">
          Failed to load featured Designer. Please try again later.
        </p>
      </div>
    );
  }

  // Safe destructuring after null check
  const {
    User: { first_name = "", last_name = "", profile_image, country } = {},
    store: { business_name, description: bio } = {},
  } = dailyVendor;

  // const { first_name = '', last_name = '', profile_image, country } = dailyVendor.User || {};
  // const { business_name, description: bio } = dailyVendor.store || {};
  const displayName = `${first_name} ${last_name}`.trim() || "Designer";

  return (
    <div className="mx-auto hidden w-full px-4 py-10 lg:block">
      <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
        Designer of the Day
      </h2>

      <div className="flex flex-col items-center gap-6 rounded-xl bg-white p-6 shadow-lg sm:flex-row">
        {/* Vendor Image */}
        <div className="flex-shrink-0 overflow-hidden rounded-xl">
          <img
            src={
              getImageUrl(profile_image) ||
              getPlaceholder(first_name, last_name)
            }
            alt={displayName}
            className="h-60 w-80 rounded-xl border-4 border-white object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getPlaceholder(first_name, last_name);
            }}
          />
        </div>

        {/* Vendor Info */}
        <div className="flex flex-1 flex-col justify-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{displayName}</h2>
            {country && <p className="mt-1 text-lg text-gray-600">{country}</p>}
          </div>

          {bio && (
            <p className="line-clamp-4 text-base leading-relaxed text-gray-600">
              {bio}
            </p>
          )}

          <div className="mt-2">
            <Link
              to={`/vendor/${dailyVendor.id}`}
              className="text-accent inline-flex items-center text-lg font-semibold hover:underline"
            >
              View profile
              <svg
                className="ml-2 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate placeholder image
function getPlaceholder(firstName = "", lastName = "") {
  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=200`;
}

export default RandomVendor;
