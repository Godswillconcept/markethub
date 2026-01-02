import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import ProfileInput from "../../pages/dashBoard/ProfileInput.jsx";
import PhoneInput from "../../ui/PhoneInput.jsx";
import { useCreateAddress } from "./useCreateAddress.js";

function NewAddressPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      fullName: "",
      label: "home", // Default to 'home' as a common default
      phone: "",
      address_line: "",
      landmark: "",
      city: "",
      state: "",
      zip: "",
      additional_info: "",
      country: "ng",
    },
  });
  const { createAddress, isPending } = useCreateAddress();

  const onSubmit = async (data) => {
    try {
      // Add +234 prefix to the phone number
      const formData = {
        ...data,
      };

      createAddress(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="mx-auto bg-white p-6">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-900">Add new address</h2>
      <p className="mt-1 text-sm text-gray-600">
        Follow the steps below and fill the required fields
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {/* Full Name */}
        <ProfileInput
          label="Full Name"
          name="fullName"
          error={errors.fullName?.message}
        >
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            className={`w-full rounded-md border ${
              errors.fullName ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500`}
            {...register("fullName", { required: "Full name is required" })}
          />
        </ProfileInput>

        {/* Address Label */}
        <ProfileInput label="Label" name="label" error={errors.label?.message}>
          <select
            id="label"
            className={`w-full rounded-md border ${errors.label ? "border-red-500" : "border-gray-300"} px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500`}
            {...register("label", { required: "Label is required" })}
          >
            <option value="home">Home</option>
            <option value="work">Work</option>
            <option value="office">Office</option>
            <option value="other">Other</option>
          </select>
        </ProfileInput>

        {/* Phone Number */}
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

        {/* Street Address */}
        <ProfileInput
          label="Street Address"
          name="address_line"
          error={errors.address_line?.message}
        >
          <input
            id="address_line"
            type="text"
            placeholder="e.g., 123 Main Street, Apt 4B"
            className={`w-full rounded-md border ${
              errors.address_line ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500`}
            {...register("address_line", {
              required: "Street address is required",
            })}
          />
        </ProfileInput>

        {/* Landmark */}
        <ProfileInput
          label="Landmark (Optional)"
          name="additional_info"
          optional
          error={errors.additional_info?.message}
        >
          <input
            id="additional_info"
            type="text"
            placeholder="e.g., Near Central Park"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            {...register("additional_info")}
          />
        </ProfileInput>

        {/* City */}
        <ProfileInput label="City" name="city" error={errors.city?.message}>
          <input
            id="city"
            type="text"
            placeholder="Enter your city"
            className={`w-full rounded-md border ${errors.city ? "border-red-500" : "border-gray-300"} px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500`}
            {...register("city", { required: "City is required" })}
          />
        </ProfileInput>

        {/* State / Province */}
        <ProfileInput
          label="State / Province / Region"
          name="state"
          error={errors.state?.message}
        >
          <select
            id="state"
            className={`w-full rounded-md border ${
              errors.state ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500`}
            {...register("state", { required: "State/Province is required" })}
          >
            <option value="">Select the state you live in</option>
            <option value="abia">Abia</option>
            <option value="adamawa">Adamawa</option>
            <option value="akwa-ibom">Akwa Ibom</option>
            <option value="anambra">Anambra</option>
            <option value="bauchi">Bauchi</option>
            <option value="bayelsa">Bayelsa</option>
            <option value="benue">Benue</option>
            <option value="borno">Borno</option>
            <option value="cross-river">Cross River</option>
            <option value="delta">Delta</option>
            <option value="ebonyi">Ebonyi</option>
            <option value="edo">Edo</option>
            <option value="ekiti">Ekiti</option>
            <option value="enugu">Enugu</option>
            <option value="gombe">Gombe</option>
            <option value="imo">Imo</option>
            <option value="jigawa">Jigawa</option>
            <option value="kaduna">Kaduna</option>
            <option value="kano">Kano</option>
            <option value="katsina">Katsina</option>
            <option value="kebbi">Kebbi</option>
            <option value="kogi">Kogi</option>
            <option value="kwara">Kwara</option>
            <option value="lagos">Lagos</option>
            <option value="nasarawa">Nasarawa</option>
            <option value="niger">Niger</option>
            <option value="ogun">Ogun</option>
            <option value="ondo">Ondo</option>
            <option value="osun">Osun</option>
            <option value="oyo">Oyo</option>
            <option value="plateau">Plateau</option>
            <option value="rivers">Rivers</option>
            <option value="sokoto">Sokoto</option>
            <option value="taraba">Taraba</option>
            <option value="yobe">Yobe</option>
            <option value="zamfara">Zamfara</option>
            <option value="fct">Federal Capital Territory</option>
          </select>
        </ProfileInput>

        {/* ZIP */}
        <ProfileInput
          label="ZIP / Postal Code"
          name="zip"
          error={errors.zip?.message}
        >
          <input
            id="zip"
            type="text"
            placeholder="e.g., 10001"
            className={`w-full rounded-md border ${
              errors.zip ? "border-red-500" : "border-gray-300"
            } px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500`}
            {...register("zip", {
              required: "ZIP/Postal code is required",
              pattern: {
                value: /^\d{5,6}(-\d{4})?$/,
                message: "Please enter a valid ZIP/Postal code",
              },
            })}
          />
        </ProfileInput>

        {/* Country */}
        <ProfileInput
          label="Country"
          name="country"
          error={errors.country?.message}
        >
          <select
            id="country"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            {...register("country")}
          >
            <option value="ng">Nigeria</option>
            <option value="gh">Ghana</option>
            <option value="ke">Kenya</option>
            <option value="za">South Africa</option>
          </select>
        </ProfileInput>

        {/* Submit Button */}
        <div className="col-span-1 mt-6 flex justify-end gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewAddressPage;
