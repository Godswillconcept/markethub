import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  CalendarDaysIcon,
  PhoneIcon,
  ClockIcon,
  TagIcon,
  PaperAirplaneIcon,
  ArchiveBoxArrowDownIcon,
  BriefcaseIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { useAdminVendorDetail } from "./useAdminVendorDetail.js";
import OverallMetrics from "./OverallMetrics.jsx";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner.jsx";
import { getImageUrl } from "../../../utils/imageUtil.js";
import { formatDateUS } from "../../../utils/helper.js";
// import { getStockStatusClasses } from "../../utils/helper";
// import { getStatusClasses } from "../../utils/helper";

const VendorDetailPage = () => {
  const { vendor, isLoading, error } = useAdminVendorDetail();

  console.log(vendor?.overall_metrics);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading vendor data
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
            <Link to="/admin/vendors" className="hover:text-gray-700">
              All Vendor
            </Link>
            <span>/</span>
            <span className="font-semibold text-gray-900">
              {vendor?.vendor_info?.name}
            </span>
          </div>
          <div className="flex space-x-3">
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
          </div>
        </div>

        {/* Vendor Profile Section */}
        <div className="mb-8 flex flex-col items-center space-y-6 rounded-lg bg-white p-6 shadow-md md:flex-row md:items-start md:space-y-0 md:space-x-6">
          <img
            src={getImageUrl(vendor?.vendor_info?.avatar)}
            alt={vendor?.vendor_info?.name}
            className="h-24 w-24 rounded-full border-2 border-gray-200 object-cover"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {vendor?.vendor_info?.name}
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-gray-700 sm:grid-cols-2">
              <div className="flex items-center">
                <EnvelopeIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>{vendor?.vendor_info?.email}</span>
              </div>
              <div className="flex items-center">
                <CalendarDaysIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>
                  Date Joined:
                  {formatDateUS(vendor?.vendor_info?.date_joined)}
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>{vendor?.vendor_info?.phone}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>Last Active: {vendor?.vendor_info?.last_active}</span>
              </div>
              <div className="flex items-center">
                <BriefcaseIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>{vendor?.vendor_info?.business_name}</span>
              </div>
              <div className="flex items-center">
                <IdentificationIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span>CAC: {vendor?.vendor_info?.cac_number}</span>
              </div>
            </div>
          </div>
          <span
          // className={`inline-flex rounded-full px-3 py-1 text-xs leading-5 font-semibold ${getStatusClasses(mockVendor.status)}`}
          >
            {vendor?.vendor_info?.status}
          </span>
        </div>

        {/* Vendor Metrics */}
        <div>
          <OverallMetrics vendor={vendor} />
        </div>

        {/* Product Activity Section */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-6 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900">
            Product Activity
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
              <tbody className="divide-y divide-gray-200 bg-white">
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
                      <span
                      // className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${getStockStatusClasses(product.stockStatus)}`}
                      >
                        {product.stock_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                      {product.total_sales}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {formatDateUS(product.last_updated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailPage;
