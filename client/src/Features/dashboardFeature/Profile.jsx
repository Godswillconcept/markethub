import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { FiChevronDown, FiCamera, FiLoader } from "react-icons/fi";
import ProfileInput from "../../pages/dashBoard/ProfileInput.jsx";
import PhoneInput from "../../ui/PhoneInput.jsx";
import { useUser } from "../authentication/useUser.js";
import { useAddresses } from "./useAddresses.js";
import { useUpdateUser } from "./useUpdateUser.js";
import toast from "react-hot-toast";
import { getImageUrl } from "../../utils/imageUtil.js";

function Profile() {
  const { user, isLoading, error } = useUser();
  const { updateUser, isUpdating } = useUpdateUser();
  const {
    addresses = [],
    isLoading: isLoadingAddresses,
    error: addressesError,
  } = useAddresses();

  // ✅ Memoize default address
  const defaultAddress = useMemo(() => {
    return Array.isArray(addresses)
      ? addresses.find((addr) => addr.is_default) || {}
      : {};
  }, [addresses]);

  const {
    address_line = "No default address found",
    state = "Not specified",
    city: defaultCity = "Not specified",
    country: defaultCountry = "Not specified",
  } = defaultAddress;

  // ✅ Memoize formatted address
  const formattedAddress = useMemo(() => {
    return `${address_line}, ${defaultCity}, ${state}, ${defaultCountry}`;
  }, [address_line, defaultCity, state, defaultCountry]);

  const { handleSubmit, register, formState, setValue, control, reset } =
    useForm({
      mode: "onChange",
    });

  const { errors, isValid, isDirty } = formState;
  const [isPhotoUpdating, setIsPhotoUpdating] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  // ✅ KEY FIX: Reset form when we have valid user data
  useEffect(() => {
    console.log("🔍 Profile useEffect triggered:", {
      isLoading,
      user,
      userKeys: user ? Object.keys(user) : "no user",
      isFormReady,
    });

    if (!isLoading && user && Object.keys(user).length > 0) {
      console.log("🔄 User data loaded, populating form:", user);

      // Extract the actual user data from nested structure
      const actualUser = user.user || user;

      const formData = {
        first_name: actualUser.first_name || "",
        last_name: actualUser.last_name || "",
        email: actualUser.email || "",
        phone: actualUser.phone || "",
        gender: actualUser.gender ? actualUser.gender.toLowerCase() : "",
        dob: actualUser.dob ? actualUser.dob.split("T")[0] : "",
        address_line: formattedAddress,
        state,
        city: actualUser.city || defaultCity,
        country: actualUser.country || defaultCountry,
      };

      console.log("📝 Setting form values:", formData);
      reset(formData, { keepDirty: false });
      setIsFormReady(true);
    } else if (!isLoading && (!user || Object.keys(user).length === 0)) {
      console.log("⚠️ No user data available, but initializing form anyway...");
      // Initialize with empty form to allow user to edit
      const emptyFormData = {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: "",
        dob: "",
        address_line: formattedAddress,
        state,
        city: defaultCity,
        country: defaultCountry,
      };
      reset(emptyFormData, { keepDirty: false });
      setIsFormReady(true);
    }
  }, [
    isFormReady,
    user,
    isLoading,
    formattedAddress,
    state,
    defaultCity,
    defaultCountry,
    reset,
  ]);

  // ✅ Fallback: Initialize form with empty data if user data is missing after a delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        !isFormReady &&
        !isLoading &&
        (!user || Object.keys(user).length === 0)
      ) {
        console.warn(
          "⚠️ No user data available - initializing with empty form",
        );
        const emptyFormData = {
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          gender: "",
          dob: "",
          address_line: formattedAddress,
          state,
          city: defaultCity,
          country: defaultCountry,
        };
        reset(emptyFormData, { keepDirty: false });
        setIsFormReady(true);
      }
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timeout);
  }, [
    isFormReady,
    isLoading,
    user,
    formattedAddress,
    state,
    defaultCity,
    defaultCountry,
    reset,
  ]);

  // ✅ Update address field separately when addresses change
  useEffect(() => {
    if (
      isFormReady &&
      defaultAddress &&
      Object.keys(defaultAddress).length > 0
    ) {
      console.log("🏠 Updating address field:", formattedAddress);
      setValue("address_line", formattedAddress, { shouldDirty: false });
    }
  }, [formattedAddress, setValue, isFormReady, defaultAddress]);

  // ✅ Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isFormReady && !isLoading) {
        console.warn(
          "⚠️ Profile loading timeout - initializing with empty form",
        );
        setIsFormReady(true);
      }
    }, 10000); // 10 seconds timeout

    return () => clearTimeout(timeout);
  }, [isFormReady, isLoading]);

  function onSubmitProfile(data) {
    if (!isValid) return;

    console.log("📤 Submitting profile update:", data);

    const { address_line, ...userData } = data;

    updateUser(userData, {
      onSuccess: (response) => {
        console.log("✅ Profile update successful:", response);
        // Form will automatically reset via useEffect when React Query updates user data
      },
      onError: (error) => {
        console.error("❌ Profile update failed:", error);
      },
    });
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    setIsPhotoUpdating(true);
    try {
      console.log("📸 Uploading photo:", file);
      // Implement your photo upload logic here
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("❌ Photo upload failed:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsPhotoUpdating(false);
    }
  };

  const handleCancel = () => {
    if (user && user.id) {
      const actualUser = user.user || user;
      const formData = {
        first_name: actualUser.first_name || "",
        last_name: actualUser.last_name || "",
        email: actualUser.email || "",
        phone: actualUser.phone || "",
        gender: actualUser.gender ? actualUser.gender.toLowerCase() : "",
        dob: actualUser.dob ? actualUser.dob.split("T")[0] : "",
        address_line: formattedAddress,
        state,
        city: actualUser.city || defaultCity,
        country: actualUser.country || defaultCountry,
      };
      reset(formData);
    }
  };

  // Show loading state while user data is being fetched
  if (isLoading || !isFormReady) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <FiLoader className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-600" />
          <p className="text-sm text-gray-500">
            {isLoading
              ? "Loading profile data..."
              : "Preparing your profile..."}
          </p>
          {!isLoading && (
            <p className="mt-1 text-xs text-gray-400">This may take a moment</p>
          )}
        </div>
      </div>
    );
  }

  // Show error state if there's an error loading user data
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-2 text-2xl text-red-500">❌</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Failed to load profile
          </h3>
          <p className="mb-1 text-sm text-gray-500">
            {error.message || "Please try again later"}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
            >
              Retry
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error loading addresses
  if (addressesError && !isLoadingAddresses) {
    console.warn("⚠️ Failed to load addresses:", addressesError.message);
    // Don't block the UI for address errors, just log them
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Follow the steps below and fill the required fields
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="mb-10 flex items-center justify-center gap-6">
        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-gray-200">
          {user?.user?.profile_image ? (
            <img
              src={getImageUrl(user.user.profile_image)}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <FiCamera className="h-full w-full p-4 text-gray-400" />
          )}
          {(isPhotoUpdating || isUpdating) && (
            <div className="bg-opacity-30 absolute inset-0 flex items-center justify-center rounded-full bg-black">
              <FiLoader className="animate-spin text-white" />
            </div>
          )}
        </div>
        <label className="cursor-pointer text-sm font-medium text-black hover:underline">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={isPhotoUpdating || isUpdating}
          />
          Change Photo
        </label>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmitProfile)}
        className="grid grid-cols-1 gap-4 gap-x-6 sm:gap-3 md:grid-cols-2"
      >
        {/* First Name */}
        <ProfileInput
          label="First Name"
          name="first_name"
          error={errors.first_name?.message}
        >
          <input
            id="first_name"
            type="text"
            placeholder="Enter first name"
            className={`w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:ring-2 focus:ring-black/80 focus:outline-none ${
              errors.first_name
                ? "border-red-500 text-red-500"
                : "border-gray-200 text-gray-900"
            }`}
            {...register("first_name", {
              required: "First name is required",
              minLength: {
                value: 2,
                message: "First name must be at least 2 characters",
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: "First name can only contain letters and spaces",
              },
            })}
          />
        </ProfileInput>

        {/* Last Name */}
        <ProfileInput
          label="Last Name"
          name="last_name"
          error={errors.last_name?.message}
        >
          <input
            id="last_name"
            type="text"
            placeholder="Enter last name"
            className={`w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:ring-2 focus:ring-black/80 focus:outline-none ${
              errors.last_name
                ? "border-red-500 text-red-500"
                : "border-gray-200 text-gray-900"
            }`}
            {...register("last_name", {
              required: "Last name is required",
              minLength: {
                value: 2,
                message: "Last name must be at least 2 characters",
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: "Last name can only contain letters and spaces",
              },
            })}
          />
        </ProfileInput>

        {/* Email */}
        <ProfileInput label="Email" name="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:ring-2 focus:ring-black/80 focus:outline-none ${
              errors.email
                ? "border-red-500 text-red-500"
                : "border-gray-200 text-gray-900"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />
        </ProfileInput>

        {/* Phone */}
        <ProfileInput
          label="Phone Number"
          name="phone"
          error={errors.phone?.message}
        >
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
              />
            )}
          />
        </ProfileInput>

        {/* Gender */}
        <ProfileInput
          label="Gender"
          name="gender"
          error={errors.gender?.message}
        >
          <div className="relative">
            <select
              id="gender"
              className={`w-full appearance-none rounded-xl border px-4 py-2 pr-10 focus:ring-2 focus:ring-black/80 focus:outline-none ${
                errors.gender
                  ? "border-red-500 text-red-500"
                  : "border-gray-200 text-gray-900"
              }`}
              {...register("gender", {
                required: "Please select your gender",
              })}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <FiChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500" />
          </div>
        </ProfileInput>

        {/* DOB */}
        <ProfileInput
          label="Date of Birth"
          name="dob"
          error={errors.dob?.message}
        >
          <input
            id="dob"
            type="date"
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-black/80 focus:outline-none ${
              errors.dob
                ? "border-red-500 text-red-500"
                : "border-gray-200 text-gray-900"
            }`}
            {...register("dob", {
              required: "Date of birth is required",
              validate: {
                notFuture: (value) => {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  return (
                    selectedDate <= today ||
                    "Date of birth cannot be in the future"
                  );
                },
                notTooOld: (value) => {
                  const selectedDate = new Date(value);
                  const hundredYearsAgo = new Date();
                  hundredYearsAgo.setFullYear(
                    hundredYearsAgo.getFullYear() - 100,
                  );
                  return (
                    selectedDate >= hundredYearsAgo ||
                    "Date of birth seems too far in the past"
                  );
                },
              },
            })}
          />
        </ProfileInput>

        {/* Address */}
        <ProfileInput
          label="Address"
          name="address_line"
          hint="Your address will be used in the shipping process"
          error={errors.address_line?.message}
          className="md:col-span-2"
        >
          <input
            id="address_line"
            type="text"
            placeholder="Enter your address"
            className={`w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:ring-2 focus:ring-black/80 focus:outline-none ${
              errors.address_line
                ? "border-red-500 text-red-500"
                : "border-gray-200 text-gray-900"
            }`}
            {...register("address_line")}
            readOnly
          />
        </ProfileInput>

        {/* City */}
        <ProfileInput label="City" name="city" error={errors.city?.message}>
          <input
            id="city"
            type="text"
            placeholder="Enter your city"
            className={`w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:ring-2 focus:ring-black/80 focus:outline-none ${
              errors.city
                ? "border-red-500 text-red-500"
                : "border-gray-200 text-gray-900"
            }`}
            {...register("city", {
              required: "City is required",
              minLength: {
                value: 2,
                message: "City name must be at least 2 characters",
              },
            })}
            readOnly
          />
        </ProfileInput>

        {/* Country */}
        <ProfileInput
          label="Country"
          name="country"
          error={errors.country?.message}
        >
          <input
            id="country"
            type="text"
            placeholder="Enter your country"
            className={`w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:ring-2 focus:ring-black/80 focus:outline-none ${
              errors.country
                ? "border-red-500 text-red-500"
                : "border-gray-200 text-gray-900"
            }`}
            {...register("country", {
              required: "Country is required",
              minLength: {
                value: 2,
                message: "Country name must be at least 2 characters",
              },
            })}
            readOnly
          />
        </ProfileInput>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2 md:col-span-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUpdating}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isUpdating || !isDirty}
            className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-semibold text-white shadow-sm hover:bg-gray-900 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-70"
          >
            {isUpdating ? (
              <>
                <FiLoader className="animate-spin" />
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;