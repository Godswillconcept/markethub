import { useRef, useEffect, useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  CloudArrowUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import MDEditor from "@uiw/react-md-editor";
import { useJournalDetail } from "./useJournalDetail.js";
import { useJournalSubmit } from "./useJournalSubmit.js";
import TagifyTags from "./TagifyTags.jsx";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AdminCreateJournal = ({
  isOpen,
  onClose,
  mode = "create",
  journalId,
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

  const { journalData, isLoading } = useJournalDetail(
    isOpen ? journalId : null,
    mode,
  );

  const mutation = useJournalSubmit();

  const isEditMode = mode === "edit";

  const [images, setImages] = useState([]);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  const imageInputRef = useRef(null);

  // Prefill form in edit mode
  useEffect(() => {
    if (!isOpen) {
      setHasLoadedData(false);
      return;
    }

    if (
      mode === "edit" &&
      journalData &&
      Object.keys(journalData).length > 0 &&
      !hasLoadedData
    ) {
      reset({
        title: journalData.title || "",
        excerpt: journalData.excerpt || "",
        tags: Array.isArray(journalData.tags)
          ? journalData.tags.join(", ")
          : "",
        category: journalData.category || "",
        content: journalData.content || "",
      });

      // Populate images - featured_images comes as JSON string from backend
      if (journalData.featured_images) {
        try {
          const imageUrls =
            typeof journalData.featured_images === "string"
              ? JSON.parse(journalData.featured_images)
              : journalData.featured_images;
          setImages(Array.isArray(imageUrls) ? imageUrls : []);
        } catch (error) {
          console.error("Failed to parse featured_images:", error);
          setImages([]);
        }
      }

      setHasLoadedData(true);
    } else if (mode === "create" && isOpen && !hasLoadedData) {
      reset({
        title: "",
        excerpt: "",
        tags: "",
        category: "",
        content: "",
      });
      setImages([]);
      setHasLoadedData(true);
    }
  }, [mode, journalData, reset, isOpen, hasLoadedData]);

  // Prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  // Handle image uploads with validation
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit`);
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

    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 5MB limit`);
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
  }, []);

  const handleDragOver = (e) => e.preventDefault();

  const removeImage = (index) =>
    setImages((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (data) => {
    try {
      // Validate required fields
      if (!data.title || data.title.trim().length < 3) {
        toast.error("Please enter a valid title (at least 3 characters)");
        return;
      }

      if (!data.excerpt || data.excerpt.trim().length < 10) {
        toast.error("Please enter a valid excerpt (at least 10 characters)");
        return;
      }

      if (!data.category) {
        toast.error("Please select a category");
        return;
      }

      if (!data.content || data.content.trim().length < 20) {
        toast.error("Please enter content (at least 20 characters)");
        return;
      }

      const formData = new FormData();

      // Add basic fields
      formData.append("title", data.title.trim());
      formData.append("excerpt", data.excerpt.trim());
      formData.append("content", data.content.trim());
      formData.append("category", data.category);

      // Convert tags to JSON array string
      const tagsArray = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [];
      formData.append("tags", JSON.stringify(tagsArray));

      // Add images (File objects only)
      const newImages = images.filter((img) => img instanceof File);
      if (newImages.length > 0) {
        newImages.forEach((img) => {
          formData.append("featured_images", img);
        });
      }

      // Validate required data for edit mode
      if (mode === "edit" && !journalId) {
        throw new Error("Journal ID is missing for edit operation");
      }

      // Use the mutation hook
      await mutation.mutateAsync({
        mode,
        journalId: mode === "edit" ? journalId : undefined,
        formData,
      });

      // Close modal on success
      onClose();
    } catch (error) {
      let errorMessage =
        "There was an error submitting the form. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.error?.errors && Array.isArray(error.error.errors)) {
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
            {mode === "create" ? "Create New Journal" : "Edit Journal"}
          </h2>
        </div>

        {isLoading && mode === "edit" ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
            <p className="ml-3 text-gray-600">Loading journal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Title */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters",
                  },
                })}
                type="text"
                disabled={mutation.isPending}
                className={`block w-full rounded-md border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm`}
                placeholder="Enter the title of your blog post"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Excerpt/Caption */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Excerpt <span className="text-red-500">*</span>
              </label>
              <input
                {...register("excerpt", {
                  required: "Excerpt is required",
                  minLength: {
                    value: 10,
                    message: "Excerpt must be at least 10 characters",
                  },
                })}
                type="text"
                disabled={mutation.isPending}
                className={`block w-full rounded-md border ${
                  errors.excerpt ? "border-red-500" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm`}
                placeholder="Brief description of your journal"
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.excerpt.message}
                </p>
              )}
            </div>

            {/* Tags & Category (side by side) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Tags */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagifyTags
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled={mutation.isPending}
                      placeholder="fashion, style, trends..."
                    />
                  )}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Type to search for existing tags or create new ones
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("category", {
                    required: "Category is required",
                  })}
                  disabled={mutation.isPending}
                  className={`block w-full rounded-md border ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm`}
                >
                  <option value="">Select category</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Style">Style</option>
                  <option value="Trends">Trends</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Sustainable Fashion">
                    Sustainable Fashion
                  </option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Content Body <span className="text-red-500">*</span>
              </label>
              <Controller
                name="content"
                control={control}
                rules={{
                  required: "Content is required",
                  minLength: {
                    value: 20,
                    message: "Content must be at least 20 characters",
                  },
                }}
                render={({ field }) => (
                  <div
                    className={`[&_.w-md-editor]:rounded-md [&_.w-md-editor]:border ${
                      errors.content
                        ? "[&_.w-md-editor]:border-red-500"
                        : "[&_.w-md-editor]:border-gray-300"
                    } [&_.w-md-editor]:shadow-sm`}
                  >
                    <MDEditor
                      {...field}
                      preview="edit"
                      height={300}
                      data-color-mode="light"
                      placeholder="Start typing your content here..."
                      disabled={mutation.isPending}
                    />
                  </div>
                )}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Featured Images Upload */}
            <div>
              <h3 className="mb-3 text-base font-medium text-gray-900">
                Featured Images
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
                  PNG, JPG, GIF up to 5MB each
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
                        alt={`Featured ${index + 1}`}
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
                    ? "Publish"
                    : "Update"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminCreateJournal;
