import { PencilIcon, TrashIcon } from "@heroicons/react/20/solid"; // Example icons
import { Link } from "react-router-dom";

const CollectionDetailHeader = () => {
  return (
    <div className="mb-6 flex flex-col border-gray-200 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left section: Collection Title and Breadcrumbs */}
      <div className="mb-4 sm:mb-0">
        <h1 className="text-md font-bold text-gray-900">Collection Detail</h1>
        <nav className="flex items-center text-sm text-gray-500">
          <Link to={"/admin/collections"} className="text-gray-600">
            All Collections
          </Link>
          <span className="mx-2">/</span>
          <Link to={"#"} className="text-gray-600">
            collection
          </Link>
        </nav>
      </div>

      {/* Right section: Action Buttons and User Info */}
      <div className="flex items-center space-x-4">
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button className="flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit Collection
          </button>
          <button className="flex items-center rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none">
            <TrashIcon className="mr-2 h-4 w-4" />
            Delete Collection
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailHeader;
