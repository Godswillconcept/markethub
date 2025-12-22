import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "../../ui/PhoneInput.jsx";
import { useVendorProfile, useUpdateVendorProfile } from "./useVendorProfile.js";
import { DataState } from "../../ui/DataState.jsx";
import { LoadingSpinner } from "../../ui/Loading/LoadingSpinner.jsx";
import { getImageUrl } from "../../utils/imageUtil.js";

export default function VendorProfile() {
  const { profile, isLoading, error } = useVendorProfile();
  const { updateProfile, isUpdating } = useUpdateVendorProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    control,
  } = useForm();

  // Populate form when data is loaded
  useEffect(() => {
    if (profile?.store) {
      reset({
        // Store Info
        business_name: profile.store.business_name,
        description: profile.store.description,
        instagram_handle: profile.store.instagram_handle,
        facebook_handle: profile.store.facebook_handle,
        twitter_handle: profile.store.twitter_handle,
        logo: profile.store.logo,

        // Bank Info & Paystack
        bank_account_name: profile.store.bank_account_name,
        bank_account_number: profile.store.bank_account_number,
        bank_name: profile.store.bank_name,
        paystack_subaccount_code: profile.store.paystack_subaccount_code,
        paystack_recipient_code: profile.store.paystack_recipient_code,

        // Personal Info (User)
        first_name: profile.User?.first_name,
        last_name: profile.User?.last_name,
        phone: profile.User?.phone,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data) => {
    updateProfile(data);
    // Note: React Query invalidation in hook will refetch data
  };

  return (
    <DataState
      isLoading={isLoading}
      isError={!!error}
      error={error}
      loadingMessage="Loading your profile..."
    >
      <div className="mx-auto max-w-4xl space-y-8 p-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendor Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store information and personal details.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Store Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b border-gray-100 pb-2 text-lg font-medium text-gray-900">
              Store Information
            </h2>

            {/* Logo Display */}
            {profile?.store?.logo && (
              <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4">
                <img
                  src={getImageUrl(profile.store.logo)}
                  alt="Store Logo"
                  className="h-24 w-24 rounded-full border border-gray-200 object-cover shadow-sm"
                />
                <div className="mt-4 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-sm font-medium text-gray-900">
                    Store Logo
                  </h3>
                  <p className="text-xs text-gray-500">
                    To update your logo, please contact administrator support.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Business Name
                </label>
                <input
                  type="text"
                  disabled // Assuming business name shouldn't be easily changeable
                  {...register("business_name")}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Contact support to change business name.
                </p>
              </div>

              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  {...register("description", {
                    required: "Description is required",
                  })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b border-gray-100 pb-2 text-lg font-medium text-gray-900">
              Social Media
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Instagram Handle
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    {...register("instagram_handle")}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 pl-8 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Facebook Handle
                </label>
                <input
                  type="text"
                  {...register("facebook_handle")}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Twitter Handle
                </label>
                <div className="relative rounded-md shadow-sm">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    {...register("twitter_handle")}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 pl-8 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b border-gray-100 pb-2 text-lg font-medium text-gray-900">
              Banking Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  {...register("bank_name", {
                    required: "Bank name is required",
                  })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
                {errors.bank_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.bank_name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <input
                  type="text"
                  {...register("bank_account_number", {
                    required: "Account number is required",
                  })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
                {errors.bank_account_number && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.bank_account_number.message}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  {...register("bank_account_name", {
                    required: "Account name is required",
                  })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
                {errors.bank_account_name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.bank_account_name.message}
                  </p>
                )}
              </div>

              <div className="col-span-2 border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-sm font-medium text-gray-900">
                  Paystack Integration
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Subaccount Code
                    </label>
                    <input
                      type="text"
                      {...register("paystack_subaccount_code")}
                      placeholder="ACCT_xxxxxxxx"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Recipient Code
                    </label>
                    <input
                      type="text"
                      {...register("paystack_recipient_code")}
                      placeholder="RCP_xxxxxxxx"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b border-gray-100 pb-2 text-lg font-medium text-gray-900">
              Personal Information
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  {...register("first_name", {
                    required: "First name is required",
                  })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  {...register("last_name", {
                    required: "Last name is required",
                  })}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Phone Number
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
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => reset()}
              disabled={!isDirty || isUpdating}
              className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || isUpdating}
              className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </DataState>
  );
}
