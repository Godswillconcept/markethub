import { useUser } from "../authentication/useUser.js";
import { getImageUrl } from "../../utils/imageUtil.js";

export default function AdminHeader() {
  const { user: hookUser, isLoading } = useUser();

  // Fallback to localStorage if hook data is missing (e.g., during refetch/reload) to prevent flickering
  const localUser = JSON.parse(localStorage.getItem("user") || "{}");
  const user =
    hookUser && Object.keys(hookUser).length > 0 ? hookUser : localUser;

  const { first_name, last_name, profile_image } = user || {};
  return (
    <header className="border-muted-border flex items-center justify-between bg-white px-6 py-2 shadow">
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {first_name} {last_name}
          </span>
          <div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            {profile_image ? (
              <img
                src={getImageUrl(profile_image)}
                alt={`${first_name} ${last_name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
                {first_name && last_name
                  ? `${first_name[0]}${last_name[0]}`.toUpperCase()
                  : "AD"}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
