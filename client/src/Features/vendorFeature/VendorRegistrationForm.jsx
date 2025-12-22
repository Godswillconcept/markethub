import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Upload, Instagram, Facebook, Twitter } from "lucide-react";
import PhoneInput from "../../ui/PhoneInput.jsx";
import { useSubmitVendorApplication } from "./useSubmitVendorApplication.js";

const VendorRegistrationForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    control,
  } = useForm();

  const { mutate, isLoading, isSuccess, isError, error } =
    useSubmitVendorApplication();

  const termsChecked = watch("terms", false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  // const [success, setSuccess] = useState("");

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).slice(0, 4 - uploadedFiles.length);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  function onSubmit(values) {
    const data = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      data.append(key, value);
    });
    uploadedFiles.forEach((file) => {
      data.append("business_images", file);
    });

    mutate(
      {
        formData: data,
        config: {
          headers: {
            "Content-Type": undefined,
          },
        },
      },
      {
        onSuccess: () => {
          console.log("Vendor application submitted successfully");
          setUploadedFiles([]); // Clear the uploaded files state
          reset();
        },
        onError: (error) => {
          console.error("Failed to submit vendor application:", error);
          setUploadedFiles([]);
          reset();
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Main Form Container */}
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Join Us!</h1>
          <p className="text-sm text-gray-500">
            Kindly provide the Information below.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                First name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("first_name", {
                  required: "First name is required",
                })}
                placeholder="Enter First Name"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
              />
              {errors.first_name && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Last name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("last_name", {
                  required: "Last name is required",
                })}
                placeholder="Enter Last Name"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
              />
              {errors.last_name && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact Fields Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="phoneNumber"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Phone Number<span className="text-red-500">*</span>
              </label>
              <Controller
                name="phone"
                control={control}
                rules={{ required: "Phone number is required" }}
                render={({ field: { value, onChange } }) => (
                  <PhoneInput
                    value={value}
                    onChange={onChange}
                    placeholder="Enter phone number"
                    error={errors.phone}
                    className="w-full"
                  />
                )}
              />
              {errors.phone && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="emailAddress"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Email Address<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email address is required",
                })}
                placeholder="Enter your Email address"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          {/* Why Join Field */}
          <div>
            <label
              htmlFor="whyJoin"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Why do you want to join Stylay
              <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register("join_reason", {
                required: "This field is required",
              })}
              placeholder="Tell us about your motivation..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
            />
            {errors.join_reason && (
              <p className="mt-1 text-sm text-red-500">
                {errors.join_reason.message}
              </p>
            )}
          </div>

          {/* Business Name */}
          <div>
            <label
              htmlFor="businessName"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Business Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("business_name", {
                required: "Business name is required",
              })}
              placeholder="Enter your business name"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
            />
            {errors.business_name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.business_name.message}
              </p>
            )}
          </div>

          {/* Business CAC Number */}
          <div>
            <label
              htmlFor="businessCAC"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Business CAC Number
            </label>
            <input
              type="text"
              {...register("cac_number", {
                required: "Business CAC is required",
              })}
              placeholder="Enter CAC registration number"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
            />
            {errors.cac_number && (
              <p className="mt-1 text-sm text-red-500">
                {errors.cac_number.message}
              </p>
            )}
          </div>

          {/* Social Media Accounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Social Media Accounts
            </h3>

            {/* Instagram */}
            <div>
              <label
                htmlFor="instagramAccount"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Social Media Account<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Instagram className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("instagram_handle", {
                    required: "Instagram is required",
                  })}
                  placeholder="Instagram Username or url link"
                  className="w-full rounded-lg border border-gray-200 py-3 pr-4 pl-10 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
                />
                {errors.instagram_handle && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.instagram_handle.message}
                  </p>
                )}
              </div>
            </div>

            {/* Facebook */}
            <div>
              <label
                htmlFor="facebookAccount"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Social Media Account<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Facebook className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("facebook_handle", {
                    required: "Facebook is required",
                  })}
                  placeholder="Facebook Username or url link"
                  className="w-full rounded-lg border border-gray-200 py-3 pr-4 pl-10 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
                />
                {errors.facebook_handle && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.facebook_handle.message}
                  </p>
                )}
              </div>
            </div>

            {/* X (Twitter) */}
            <div>
              <label
                htmlFor="xAccount"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                Social Media Account<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Twitter className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  {...register("twitter_handle", {
                    required: "Twitter is required",
                  })}
                  placeholder="X Username or url link"
                  className="w-full rounded-lg border border-gray-200 py-3 pr-4 pl-10 placeholder-gray-400 transition-all duration-200 outline-none focus:border-transparent focus:ring-2 focus:ring-gray-900"
                />
                {errors.twitter_handle && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.twitter_handle.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Upload design samples<span className="text-red-500">*</span>
            </label>

            <div className="flex gap-4">
              {/* Main Upload Area */}
              <div className="flex-1">
                <div
                  className={`relative flex min-h-[280px] items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />

                  <div className="space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                      <div className="flex h-8 w-8 items-center justify-center rounded border-2 border-dashed border-gray-300">
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Click to browse
                      <span className="text-xs text-gray-400">(4 mb max)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Files Preview */}
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-lg border-2 ${
                        uploadedFiles[index]
                          ? "border-gray-300 bg-gray-100"
                          : "border-dashed border-gray-200"
                      }`}
                    >
                      {uploadedFiles[index] ? (
                        <img
                          src={URL.createObjectURL(uploadedFiles[index])}
                          alt={`Upload ${index + 1}`}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <Upload className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    {uploadedFiles[index] && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-xs text-white transition-colors duration-200 hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              {...register("terms", {
                required: "You must accept the terms and conditions",
              })}
              className="mt-1 h-4 w-4 rounded border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-gray-900"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-600">
              I have read and accept the Terms of Use
            </label>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-500">
                {errors.terms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!termsChecked}
            className="w-full cursor-pointer rounded-lg bg-gray-900 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
          >
            Submit
          </button>
          {isSuccess && (
            <p className="text-green-600">Submitted successfully!</p>
          )}
          {isError && (
            <p className="text-red-600">Failed to submit application.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default VendorRegistrationForm;
