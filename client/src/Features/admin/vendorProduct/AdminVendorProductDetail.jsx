import {
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  CubeTransparentIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Link, useParams } from "react-router";
import { useAdminProductView } from "./useAdminProductDetail.js";
import AdminProductStatsCard from "./AdminProductStatsCard.jsx";
import { useProductAnalysis } from "./useProductAnalysis.js";
import { formatCurrency } from "../../../utils/formatCurrency.js";
import { formatDate, safeRender } from "../../../utils/helper.js";
import { useState } from "react";
import { useNavigate } from "react-router";
import AdminCreateProduct from "./AdminCreateProduct.jsx";
import { useDeleteProduct } from "./useDeleteProduct.js";
import ConfirmModal from "../../../ui/ConfirmModal.jsx";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../utils/imageUtil.js";
import { LoadingSpinner } from "../../../ui/Loading/LoadingSpinner.jsx";

const AdminVendorProductDetail = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { productId } = useParams();
  const { product = {}, isLoading } = useAdminProductView(productId);
  const navigate = useNavigate();
  const { deleteProduct, isDeleting } = useDeleteProduct();
  const {
    name,
    vendor,
    category,
    sku,
    created_at,
    updated_at,
    price,
    variants,
    status,
    description,
    images,
    thumbnail,
    date_uploaded,
  } = product || {};

  // Log for debugging
  console.log("Product object keys:", Object.keys(product));
  console.log("Product data:", JSON.stringify(product, null, 2));
  console.log("Category:", category);
  console.log("Created at:", created_at);
  const { productAnalysis = {}, isLoading: isLoadingAnalysis } =
    useProductAnalysis(productId);
  const { analytics, product: productStats } = productAnalysis || {};

  // Get stock from analytics or default to 0
  const stockQuantity = productStats?.stock || 0;

  // Get status from product or analytics
  const productStatus = productStats?.status || status || "unknown";

  const colorValues = variants
    ?.filter((variant) => variant.name === "color")
    ?.map((variant) => variant.value)
    ?.join(", ");
  const sizeValues = variants
    ?.filter((variant) => variant.name === "size")
    ?.map((variant) => variant.value)
    ?.join(", ");

  // Open delete confirmation modal
  function handleDeleteProduct() {
    setDeleteModalOpen(true);
  }

  // Confirm and execute delete
  function confirmDelete() {
    deleteProduct(productId, {
      onSuccess: () => {
        toast.success("Product successfully deleted!");
        setDeleteModalOpen(false);
        navigate("/admin/vendor-products");
      },
      onError: (error) => {
        toast.error(`Deletion failed: ${error.message || "Unknown error"}`);
        setDeleteModalOpen(false);
      },
    });
  }

  // Cancel delete
  function cancelDelete() {
    setDeleteModalOpen(false);
  }

  if (isLoading || isLoadingAnalysis) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow-sm">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">{`${name} Detail`}</h1>
              <nav className="text-sm text-gray-500">
                <Link to={`/admin/vendor-products`} className="hover:underline">
                  All Products
                </Link>
                <span className="mx-2">/</span>
                <Link to={`#`} className="hover:underline">
                  {safeRender(category?.name || category)}
                </Link>
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <PencilSquareIcon className="h-5 w-5" />
                <span>Edit Product</span>
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                <TrashIcon className="h-5 w-5" />
                <span>Remove Product</span>
              </button>
              <button
                disabled
                className="flex items-center space-x-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TagIcon className="h-5 w-5" />
                <span>Tag/Change Vendor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content: Image Gallery + Product Info */}
        <div className="lg:grid-rows mb-8 grid grid-cols-1 gap-6">
          {/* Image Gallery */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Main Image - Landscape */}
              <div
                className="relative w-full overflow-hidden rounded-lg bg-gray-100 lg:w-4/4"
                style={{ aspectRatio: "8/3" }}
              >
                <img
                  src={getImageUrl(thumbnail)}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Thumbnails - Vertical Stack */}
              <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
                {images?.map((thumb, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img
                      src={getImageUrl(thumb.image_url)}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-20 w-20 cursor-pointer rounded-md border-2 border-transparent object-cover hover:border-red-500 lg:h-24 lg:w-36"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">{name}</h2>

            <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Vendor:{" "}
                    </span>
                    <span className="text-black">
                      {safeRender(
                        vendor?.store?.business_name || vendor?.name || vendor,
                      )}
                    </span>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                    {productStatus}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Category:{" "}
                  </span>
                  <span className="text-black">
                    {safeRender(category?.name || category, "Uncategorized")}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Date Added:{" "}
                  </span>
                  <span className="text-gray-900">
                    {date_uploaded
                      ? formatDate(date_uploaded)
                      : created_at
                        ? formatDate(created_at)
                        : updated_at
                          ? formatDate(updated_at)
                          : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Price: </span>
                  <span className="font-bold text-gray-900">
                    {price ? formatCurrency(price) : "N/A"}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-700">
                    SKU / Product ID:{" "}
                  </span>
                  <span className="text-gray-900">{sku || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Stock Quantity:{" "}
                  </span>
                  <span className="text-gray-900">
                    {stockQuantity === 0 ? (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                        Out of Stock (0)
                      </span>
                    ) : (
                      stockQuantity
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Size: </span>
                  <span className="text-gray-900">{sizeValues}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Color: </span>
                  <span className="text-gray-900">{colorValues}</span>
                </div>
              </div>
            </div>
            {/* Product Description */}
            <div className="mt-6">
              <h3 className="mb-2 text-base font-semibold text-gray-700">
                Product Description
              </h3>
              <div className="min-h-[80px] w-full resize-none rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:outline-none">
                {description}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Views Card */}
          <AdminProductStatsCard
            title="Total Views"
            value={productStats?.impressions || 0}
            change={0}
            type="up"
            icon={
              <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                <UsersIcon className="h-6 w-6" />
              </div>
            }
          />

          {/* Total Revenue Card */}
          <AdminProductStatsCard
            title="Total Revenue"
            value={formatCurrency(analytics?.total_revenue || 0)}
            change={0}
            type="up"
            icon={
              <div className="rounded-full bg-yellow-100 p-3 text-yellow-600">
                <CubeTransparentIcon className="h-6 w-6" />
              </div>
            }
          />

          {/* Units Sold Card */}
          <AdminProductStatsCard
            title="Units Sold"
            value={analytics?.total_units_sold || 0}
            change={0}
            type="up"
            icon={
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <ArrowTrendingUpIcon className="h-6 w-6" />
              </div>
            }
          />

          {/* Conversion Rate Card */}
          <AdminProductStatsCard
            title="Conversion Rate"
            value={`${analytics?.conversion_rate || 0}%`}
            change={0}
            type="up"
            icon={
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <ArrowTrendingUpIcon className="h-6 w-6" />
              </div>
            }
          />
        </div>

        {/* Additional Information Section */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Last Purchase Date Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Last Purchase Date
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {analytics?.last_sale_date
                    ? formatDate(analytics.last_sale_date)
                    : "No sales yet"}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <CalendarDaysIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Orders
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {analytics?.total_orders || 0}
                </p>
              </div>
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <CubeTransparentIcon className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Average Order Value Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Order Value
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(analytics?.average_order_value || 0)}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                <ArrowTrendingUpIcon className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <AdminCreateProduct
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          mode="edit"
          productId={productId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
};

export default AdminVendorProductDetail;
