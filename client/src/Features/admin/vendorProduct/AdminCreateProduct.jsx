import { useRef, useEffect, useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import AsyncSelect from "react-select/async";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  CloudArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAdminProductDetail } from "./useAdminProductDetail.js";
import { useSelectVendor } from "./useSelectVendor.js";
import { useSelectCategory } from "./useSelectCategory.js";
import { useProductSubmit } from "./useProductSubmit.js";
import {
  getAllVendorsInput,
  getAllCategoriesInput,
} from "../../../services/apiAdminProduct";
import { getImageUrl } from "../../../utils/imageUtil.js";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

const AdminCreateProduct = ({
  isOpen,
  onClose,
  mode = "create",
  productId,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const { productData, isLoading } = useAdminProductDetail(
    isOpen ? productId : null,
    mode,
  );

  const mutation = useProductSubmit();

  const isEditMode = mode === "edit";

  // State for variants (dynamic list)
  const [variants, setVariants] = useState([
    { type: "Color", value: "", additional_price: 0 },
  ]);

  const [images, setImages] = useState([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const imageInputRef = useRef(null);

  // Generate SKU based on product info (disabled in edit mode)
  const generateSKU = async () => {
    if (isEditMode) {
      toast.error("SKU cannot be regenerated in edit mode");
      return;
    }

    const productName = watch("productName") || "";
    const categoryValue = watch("category");
    const price = watch("price") || "";

    if (!productName) {
      toast.error("Please enter a product name first");
      return;
    }

    let categoryName = "GEN";
    if (categoryValue?.label) {
      const parts = categoryValue.label.split(">");
      categoryName = parts[parts.length - 1].trim();
    }

    const nameWords = productName.trim().split(/\s+/);
    const namePart = nameWords
      .map((word) => word.substring(0, 3).toUpperCase())
      .join("-")
      .substring(0, 12);

    const categoryPart = categoryName.substring(0, 3).toUpperCase();
    const randomPart = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const pricePart = price ? Math.floor(price).toString().substring(0, 2) : "";

    const sku = `${namePart}-${categoryPart}-${randomPart}${pricePart ? "-" + pricePart : ""}`;

    setValue("sku", sku);
  };

  const [vendorSearch, setVendorSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const { data: vendorOptions = [], isLoading: vendorsLoading } =
    useSelectVendor(vendorSearch);
  const { data: categoryOptions = [], isLoading: categoriesLoading } =
    useSelectCategory(categorySearch);

  // Debounced search for vendors - fetches from API
  const loadVendors = async (inputValue) => {
    setVendorSearch(inputValue);
    if (!inputValue || inputValue.length < 2) {
      return vendorOptions; // Return cached options for short input
    }
    try {
      const data = await getAllVendorsInput(inputValue);
      return data.map((vendor) => ({
        value: vendor.id,
        label: vendor.store?.business_name || "Unknown Vendor",
        vendor: vendor,
      }));
    } catch (error) {
      toast.error("Failed to search vendors");
      return vendorOptions;
    }
  };

  // Debounced search for categories - fetches from API
  const loadCategories = async (inputValue) => {
    setCategorySearch(inputValue);
    if (!inputValue || inputValue.length < 2) {
      return categoryOptions; // Return cached options for short input
    }
    try {
      const data = await getAllCategoriesInput(inputValue);
      // Flatten and transform categories
      const flattened = [];
      data.forEach((category) => {
        if (category.children && category.children.length > 0) {
          category.children.forEach((child) => {
            flattened.push({
              value: child.id,
              label: `${category.name} > ${child.name}`,
            });
          });
        } else {
          flattened.push({
            value: category.id,
            label: category.name,
          });
        }
      });
      return flattened;
    } catch (error) {
      toast.error("Failed to search categories");
      return categoryOptions;
    }
  };

  // Prefill form in edit mode
  useEffect(() => {
    if (!isOpen) {
      setHasLoadedData(false);
      return;
    }

    if (
      mode === "edit" &&
      productData &&
      Object.keys(productData).length > 0 &&
      !hasLoadedData
    ) {
      const vendorId = productData.vendor?.id || "";
      const vendorName = productData.vendor?.store?.business_name || "";
      const categoryId = productData.Category?.id || "";
      const categoryName = productData.Category?.name || "";

      reset({
        productName: productData.name || "",
        category: categoryId
          ? { value: categoryId, label: categoryName }
          : null,
        description: productData.description || "",
        price: productData.price || "",
        sku: productData.sku || "",
        vendor: vendorId ? { value: vendorId, label: vendorName } : null,
      });

      // FIX: Properly populate variants with correct type mapping
      // FIX: Properly populate variants with correct type mapping
      if (productData.variants && productData.variants.length > 0) {
        const formattedVariants = productData.variants.map((v) => {
          // Map the database variant name to proper select option format
          let variantType = "Color"; // default

          const variantName = (v.name || v.type || "").toLowerCase();

          // Map database names to select dropdown values
          switch (variantName) {
            case "size":
              variantType = "Size";
              break;
            case "color":
              variantType = "Color";
              break;
            case "fit":
              variantType = "fit"; // Keep lowercase to match your dropdown
              break;
            case "style":
              variantType = "Style";
              break;
            default:
              // Capitalize first letter for any other type
              variantType =
                variantName.charAt(0).toUpperCase() + variantName.slice(1);
          }

          return {
            type: variantType,
            value: v.value || "",
            additional_price: parseFloat(v.additional_price || 0),
          };
        });
        setVariants(formattedVariants);
      }

      // Populate images
      if (productData.images && Array.isArray(productData.images)) {
        const imageUrls = productData.images.map((img) => img.image_url);
        setImages(imageUrls);
      } else if (productData.thumbnail) {
        setImages([getImageUrl(productData.thumbnail)]);
      }

      setHasLoadedData(true);
    } else if (mode === "create" && isOpen && !hasLoadedData) {
      reset({
        productName: "",
        category: null,
        description: "",
        price: "",
        sku: "",
        vendor: null,
      });
      setVariants([{ type: "Color", value: "", additional_price: 0 }]);
      setImages([]);
      setHasLoadedData(true);
    }
  }, [mode, productData, reset, isOpen, hasLoadedData]);

  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  // Handle image uploads (multiple images) with validation
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 4MB limit`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
  }, []);

  const handleDragOver = (e) => e.preventDefault();

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  // Variant management
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { type: "Color", value: "", additional_price: 0 },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index][field] =
        field === "additional_price" ? parseFloat(value) || 0 : value;
      return updated;
    });
  };

  const onSubmit = async (data) => {
    try {
      // Validate required fields before submission
      if (!data.productName || data.productName.trim().length < 3) {
        toast.error(
          "Please enter a valid product name (at least 3 characters)",
        );
        return;
      }

      if (!data.price || data.price <= 0) {
        toast.error("Please enter a valid price");
        return;
      }

      if (!data.category || !data.category.value) {
        toast.error("Please select a category");
        return;
      }

      if (!data.vendor || !data.vendor.value) {
        toast.error("Please select a vendor");
        return;
      }

      const formData = new FormData();

      // Add basic fields with explicit values
      formData.append("vendor_id", String(data.vendor.value));
      formData.append("name", data.productName.trim());
      formData.append("description", data.description?.trim() || "");
      formData.append("price", String(data.price));
      formData.append("category_id", String(data.category.value));

      if (data.sku && data.sku.trim()) {
        formData.append("sku", data.sku.trim());
      }

      // Add variants as JSON string
      const validVariants = variants
        .filter((v) => v.value && v.value.trim() !== "")
        .map((v) => ({
          type: v.type,
          value: v.value.trim(),
          additional_price: parseFloat(v.additional_price) || 0,
        }));

      if (validVariants.length > 0) {
        formData.append("variants", JSON.stringify(validVariants));
      }

      // Add images (File objects only)
      const newImages = images.filter((img) => img instanceof File);
      if (newImages.length > 0) {
        newImages.forEach((img) => {
          formData.append("images", img);
        });
      }

      // Validate required data for edit mode
      if (mode === "edit" && !productId) {
        throw new Error("Product ID is missing for edit operation");
      }

      // Use the combined mutation hook with mode, productId, and formData
      await mutation.mutateAsync({
        mode,
        productId: mode === "edit" ? productId : undefined,
        formData,
      });

      // Show success message
      toast.success(
        mode === "create"
          ? "Product created successfully!"
          : "Product updated successfully!",
      );

      // Close modal on success
      onClose();
    } catch (error) {
      // Extract error message from API response if available
      let errorMessage =
        "There was an error submitting the form. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.error?.errors && Array.isArray(error.error.errors)) {
        // Handle validation errors - show first 3 errors
        const errorMessages = error.error.errors
          .slice(0, 3)
          .map((e) => e.message);
        errorMessage = errorMessages.join(" | ");
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      toast.error(errorMessage);
    }
  };

  // Helper to render image (File or URL)
  const renderImage = (image) => {
    if (typeof image === "string") return image;
    return URL.createObjectURL(image);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="bg-gray bg-opacity-5 fixed inset-0 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600"
          disabled={mutation.isPending}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-center text-xl font-semibold text-gray-900">
            {mode === "create" ? "Create New Product" : "Edit Product"}
          </h2>
        </div>

        {isLoading && mode === "edit" ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
            <p className="ml-3 text-gray-600">Loading product...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Product Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("productName", {
                  required: "Product name is required",
                  minLength: {
                    value: 3,
                    message: "Product name must be at least 3 characters",
                  },
                })}
                type="text"
                disabled={mutation.isPending}
                className={`block w-full rounded-md border ${
                  errors.productName ? "border-red-500" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm`}
                placeholder="e.g., Stylish Cotton Hoodie"
              />
              {errors.productName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.productName.message}
                </p>
              )}
            </div>

            {/* Category & SKU (side by side) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      cacheOptions
                      defaultOptions={categoryOptions}
                      loadOptions={loadCategories}
                      placeholder="Search categories..."
                      isClearable
                      isLoading={categoriesLoading}
                      isDisabled={mutation.isPending}
                      onInputChange={(value) => setCategorySearch(value)}
                      className={
                        errors.category ? "rounded-md border-red-500" : ""
                      }
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: errors.category
                            ? "#ef4444"
                            : base.borderColor,
                          "&:hover": {
                            borderColor: errors.category
                              ? "#ef4444"
                              : "#d1d5db",
                          },
                          boxShadow: state.isFocused
                            ? errors.category
                              ? "0 0 0 1px #ef4444"
                              : "0 0 0 1px #ef4444"
                            : base.boxShadow,
                        }),
                      }}
                    />
                  )}
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  SKU (Stock Keeping Unit)
                </label>
                <div className="flex gap-2">
                  <input
                    {...register("sku")}
                    type="text"
                    disabled={isEditMode || mutation.isPending}
                    className={`block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm ${
                      isEditMode || mutation.isPending
                        ? "cursor-not-allowed bg-gray-100"
                        : ""
                    }`}
                    placeholder="e.g., ADM-HOODIE-COT-002"
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    disabled={isEditMode || mutation.isPending}
                    className={`rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ${
                      isEditMode || mutation.isPending
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Generate
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isEditMode
                    ? "SKU cannot be changed in edit mode"
                    : "Auto-generate based on product details or enter manually"}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register("description")}
                rows="4"
                disabled={mutation.isPending}
                className="block w-full resize-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm"
                placeholder="Detailed description of the product"
              />
            </div>

            {/* Price & Vendor (side by side) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Price */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Base Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    ₦
                  </span>
                  <input
                    {...register("price", {
                      required: "Price is required",
                      min: {
                        value: 0.01,
                        message: "Price must be greater than 0",
                      },
                      valueAsNumber: true,
                    })}
                    type="number"
                    min="0.01"
                    step="0.01"
                    disabled={mutation.isPending}
                    placeholder="0.00"
                    className={`block w-full rounded-md border ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    } py-2 pr-12 pl-7 focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Vendor */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="vendor"
                  control={control}
                  rules={{ required: "Vendor is required" }}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      cacheOptions
                      defaultOptions={vendorOptions}
                      loadOptions={loadVendors}
                      placeholder="Search vendors..."
                      isClearable
                      isLoading={vendorsLoading}
                      isDisabled={mutation.isPending}
                      onInputChange={(value) => setVendorSearch(value)}
                      className={
                        errors.vendor ? "rounded-md border-red-500" : ""
                      }
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: errors.vendor
                            ? "#ef4444"
                            : base.borderColor,
                          "&:hover": {
                            borderColor: errors.vendor ? "#ef4444" : "#d1d5db",
                          },
                          boxShadow: state.isFocused
                            ? errors.vendor
                              ? "0 0 0 1px #ef4444"
                              : "0 0 0 1px #ef4444"
                            : base.boxShadow,
                        }),
                      }}
                    />
                  )}
                />
                {errors.vendor && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor.message}
                  </p>
                )}
              </div>
            </div>

            {/* Variants Section */}
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">
                  Product Variants
                </h3>
                <button
                  type="button"
                  onClick={addVariant}
                  disabled={mutation.isPending}
                  className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Variant
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-3 rounded-md border border-gray-200 bg-gray-50 p-3"
                  >
                    {/* Variant Type */}
                    <div className="col-span-3">
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Type
                      </label>
                      <select
                        value={variant.type}
                        onChange={(e) =>
                          updateVariant(index, "type", e.target.value)
                        }
                        disabled={mutation.isPending}
                        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                      >
                        <option value="Color">Color</option>
                        <option value="Size">Size</option>
                        <option value="fit">Fit</option>{" "}
                        {/* Changed from "fit" lowercase and "Style" */}
                        <option value="Style">Style</option>
                      </select>
                    </div>

                    {/* Variant Value */}
                    <div className="col-span-5">
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Value
                      </label>
                      <input
                        type="text"
                        value={variant.value}
                        onChange={(e) =>
                          updateVariant(index, "value", e.target.value)
                        }
                        disabled={mutation.isPending}
                        placeholder="e.g., Blue, Large"
                        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                      />
                    </div>

                    {/* Additional Price */}
                    <div className="col-span-3">
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        +Price (₦)
                      </label>
                      <input
                        type="number"
                        value={variant.additional_price}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "additional_price",
                            e.target.value,
                          )
                        }
                        disabled={mutation.isPending}
                        min="0"
                        step="0.01"
                        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length === 1 || mutation.isPending}
                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Variants allow customers to choose different options (colors,
                sizes, etc.). The additional price will be added to the base
                price.
              </p>
            </div>

            {/* Image Upload Section */}
            <div>
              <h3 className="mb-3 text-base font-medium text-gray-900">
                Product Images
              </h3>

              <div
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400 hover:bg-gray-50 ${
                  mutation.isPending ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={() =>
                  !mutation.isPending && imageInputRef.current.click()
                }
                onDrop={!mutation.isPending ? handleDrop : undefined}
                onDragOver={!mutation.isPending ? handleDragOver : undefined}
              >
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  disabled={mutation.isPending}
                  onChange={handleFileChange}
                />
                <CloudArrowUpIcon className="mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 4MB each
                </p>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                    >
                      <img
                        src={renderImage(image)}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={mutation.isPending}
                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={mutation.isPending}
                className="rounded-md border border-gray-300 bg-white px-8 py-2 font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2 rounded-md bg-black px-12 py-2 font-medium text-white shadow-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                )}
                {mutation.isPending
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                    ? "Create Product"
                    : "Update Product"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminCreateProduct;
