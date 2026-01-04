import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Pagination from "../Pagination.jsx";
import AdminCreateProduct from "./AdminCreateProduct.jsx";
import AdminFilterBar from "../AdminFilterBar.jsx";
import Table from "../Table.jsx";
import { useAdminProduct } from "./useAdminProduct.js";
import { useDeleteProduct } from "./useDeleteProduct.js";
import ConfirmModal from "../../../ui/ConfirmModal.jsx";
import toast from "react-hot-toast";
import { getImageUrl } from "../../../utils/imageUtil.js";

const headers = [
  { key: "image", label: "Image", className: "w-32" },
  { key: "name", label: "Product Name", className: "w-62" },
  { key: "category", label: "Category", className: "w-32" },
  { key: "price", label: "Price", className: "w-32" },
  { key: "piece", label: "Piece", className: "w-32" },
  { key: "colors", label: "Available Color", className: "w-32" },
  { key: "action", label: "Action", className: "w-28" },
];

const VendorProducts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingProductId, setEditingProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const [filters, setFilters] = useState({
    category: "All",
    vendor: "All",
    active: "All",
  });
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const itemsPerPage = 12; // Updated to match PAGE_SIZE

  const {
    adminProduct = [],
    total = 0,
    isLoading,
    error,
  } = useAdminProduct(currentPage, itemsPerPage, filters);
  const { deleteProduct, isDeleting } = useDeleteProduct(); // Removed unused deleteProductAsync

  // Extract unique categories from products
  const categoryOptions = useMemo(() => {
    const categories = adminProduct
      .map((product) => product.Category?.name || product.category?.name)
      .filter(Boolean);
    return ["All", ...new Set(categories)];
  }, [adminProduct]);

  const filterConfig = [
    {
      key: "category",
      label: "Category",
      options: categoryOptions,
    },
    // Vendor and active filters are not configurable via options here,
    // but the filter logic remains in useMemo.
  ];

  // Handle filter changes from AdminFilterSection
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: "All",
      vendor: "All",
      active: "All",
    });
    setSearchTerm("");
    searchParams.delete("search");
    setSearchParams(searchParams);
    setCurrentPage(1);
  };

  // Debounce search term and update URL
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm && searchTerm.length >= 3) {
        searchParams.set("search", searchTerm);
        searchParams.set("page", "1");
      } else {
        searchParams.delete("search");
      }
      setSearchParams(searchParams);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, setSearchParams]);

  const handleCreateProduct = () => {
    setMode("create");
    setEditingProductId(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (id) => {
    setMode("edit");
    setEditingProductId(id);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  function handleDeleteProduct(productId) {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  }

  // Confirm and execute delete
  function confirmDelete() {
    if (!productToDelete) return;

    deleteProduct(productToDelete, {
      onSuccess: () => {
        toast.success("Product successfully deleted!");
        setDeleteModalOpen(false);
        setProductToDelete(null);
      },
      onError: (error) => {
        toast.error(`Deletion failed: ${error.message || "Unknown error"}`);
        setDeleteModalOpen(false);
        setProductToDelete(null);
      },
    });
  }

  // Cancel delete
  function cancelDelete() {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  }

  const renderProductRow = (product) => {
    // 1. Filter for only 'Color' variants
    const colorVariants = product.variants
      ? product.variants.filter(
          (v) => v.name && v.name.toLowerCase() === "color" && v.value,
        )
      : [];
    console.log("colorVariants", colorVariants);

    return [
      <td key="image" className="px-6 py-4 text-center text-sm">
        <img
          src={
            getImageUrl(product.thumbnail) ||
            "https://placehold.co/64x64/E0E7FF/374151?text=No+Image"
          }
          alt={product.name}
          className="mx-auto h-16 w-16 rounded object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/64x64/E0E7FF/374151?text=No+Image";
          }}
        />
      </td>,
      <td key="name" className="px-6 py-4 text-sm font-medium text-gray-900">
        <Link to={`/admin/vendor-products/${product.id}`}>{product.name}</Link>
      </td>,
      <td key="category" className="px-6 py-4 text-center text-sm">
        {product.Category?.name || product.category?.name || "N/A"}
      </td>,
      <td key="price" className="px-6 py-4 text-center text-sm">
        ${product.discounted_price || product.price}
        {product.discounted_price && (
          <span className="ml-2 text-xs text-gray-400 line-through">
            ${product.price}
          </span>
        )}
      </td>,
      <td key="piece" className="px-6 py-4 text-center text-sm text-gray-500">
        {product.sold_units || 0}
      </td>,
      <td key="colors" className="px-6 py-4">
        <div className="flex justify-center space-x-2">
          {colorVariants.length > 0 ? (
            colorVariants.slice(0, 5).map((variant, index) => (
              // 2. Use variant.value for background color and title
              <div
                key={index}
                className="h-6 w-6 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: variant.value }}
                title={variant.value}
              />
            ))
          ) : (
            <span className="text-sm text-gray-500">No colors</span>
          )}
        </div>
      </td>,
      <td key="action" className="px-6 py-4">
        <div className="flex items-center justify-center space-x-3">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault();
              handleEditProduct(product.id);
            }}
            disabled={isDeleting}
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
            onClick={(e) => {
              e.preventDefault();
              handleDeleteProduct(product.id);
            }}
            disabled={isDeleting}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>,
    ];
  };

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error loading products: {error.message}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button
          className="rounded-md bg-black px-4 py-2 font-medium text-white shadow transition hover:bg-gray-800"
          onClick={handleCreateProduct}
        >
          Create New Product
        </button>
      </div>

      {/* Filter Section */}
      <AdminFilterBar
        filters={filters}
        filterConfig={filterConfig}
        onFilterChange={handleFilterChange}
        onSearch={searchTerm}
        onSearchChange={setSearchTerm}
        onResetFilters={handleResetFilters}
        searchPlaceholder="Search products..."
      />

      {/* Products Table */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">
          Loading products...
        </div>
      ) : (
        <Table
          headers={headers}
          data={adminProduct || []}
          renderRow={renderProductRow}
        />
      )}

      {/* Pagination */}
      {!isLoading && adminProduct.length > 0 ? (
        <Pagination
          totalItems={total}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          className="mt-6"
        />
      ) : !isLoading ? (
        <div className="mt-6 text-center text-gray-500">
          No products found matching your criteria
        </div>
      ) : null}

      {/* Modal for Create/Edit */}
      <AdminCreateProduct
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        productId={Number(editingProductId)}
      />

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

export default VendorProducts;
