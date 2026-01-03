import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  CalendarDaysIcon,
  PhoneIcon,
  ClockIcon,
  // TagIcon,
  // PaperAirplaneIcon,
  // ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useAdminUserDetail } from "./useAdminUserDetail";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner";
import { formatDate } from "../../../utils/helper";

function AdminUsersDetailPage() {
  const { user, isLoading, error } = useAdminUserDetail();

  console.log(user);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading user data
      </div>
    );

  // Helper for status chip styling
  <getStatusClasses />;

  // Helper for stock status styling
  <getStockStatusClasses />;

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-2">
      <div className="mx-auto max-w-7xl">
        {/* Top Header & Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link to="/admin-users" className="hover:text-gray-700">
              All Users
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-900">
              {user?.first_name} {user?.last_name}
            </span>
          </div>
          {/* <div className="flex space-x-3">
            <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ArchiveBoxArrowDownIcon className="mr-2 h-4 w-4" />
              Suspend
            </button>
            <button className="flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <TagIcon className="mr-2 h-4 w-4" />
              Tag to New Product
            </button>
            <button className="flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
              <PaperAirplaneIcon className="mr-2 h-4 w-4" />
              Send Mail
            </button>
          </div> */}
        </div>

        {/* Vendor Profile Section */}
        <div className="mb-8 flex flex-col items-center space-y-6 rounded-lg bg-white p-6 shadow-md md:flex-row md:items-start md:space-y-0 md:space-x-6">
          <img
            src={user?.profile_image}
            alt={user?.user_info?.name}
            className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-gray-700 sm:grid-cols-2">
              <div className="flex items-center">
                <EnvelopeIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center">
                <CalendarDaysIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>
                  Date Joined:
                  {formatDate(user?.created_at)}
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>
                  Last Active: {user?.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <span
            className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
              user.is_active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Product Activity Section */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-6 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900">
            Orderd Products
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Product Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Units Sold
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Stock Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Total Sales
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Last Updated
                  </th>
                </tr>
              </thead>
              {/* <tbody className="divide-y divide-gray-200 bg-white">
                {vendor?.products_breakdown.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                      {product.product_name}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {product.units_sold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span>{product.stock_status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {product.total_sales}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {new Date(product.last_updated).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody> */}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsersDetailPage;
