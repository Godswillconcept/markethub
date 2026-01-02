import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import ProfileInput from "../../pages/dashBoard/ProfileInput.jsx";
import { useAddress } from "./useAddress.js";
import { useUpdateAddress } from "./useUpdateAddress.js";

export default function EditAddressPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { address } = useAddress(id);
    const { updateAddress, isUpdating } = useUpdateAddress();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    // Set form values when address data is loaded
    useEffect(() => {
        if (address) {
            reset({
                label: address.label,
                address_line: address.address_line,
                city: address.city,
                state: address.state,
                country: address.country,
            });
        }
    }, [address, reset]);


    const onSubmit = (data) => {
        updateAddress(
            { 
                id, 
                addressData: data 
            },
            {
                onSuccess: () => {
                    navigate(-1); // Go back to the previous page
                },
            }
        );
    };

    // if (isLoadingAddress) return <div>Loading address...</div>;
    // if (!address) return <div>Address not found</div>;

    return (
        <div className="mx-auto bg-white p-6">
            {/* Header */}
            <h2 className="text-xl font-semibold text-gray-900">Edit Address</h2>
            <p className="mt-1 text-sm text-gray-600">
                Update your address information below
            </p>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
                {/* Address Label */}
                <ProfileInput
                    label="Label"
                    name="label"
                    error={errors.label?.message}
                >
                    <input
                        id="label"
                        type="text"
                        placeholder="e.g., Home, Work, Office"
                        className={`w-full rounded-md border ${errors.label ? "border-red-500" : "border-gray-300"
                            } px-3 py-2 text-sm focus:border-black focus:ring-black`}
                        {...register("label", { required: "Label is required" })}
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
                        className={`w-full rounded-md border ${errors.address_line ? "border-red-500" : "border-gray-300"
                            } px-3 py-2 text-sm focus:border-black focus:ring-black`}
                        {...register("address_line", { required: "Street address is required" })}
                    />
                </ProfileInput>

                {/* City */}
                <ProfileInput
                    label="City"
                    name="city"
                    error={errors.city?.message}
                >
                    <input
                        id="city"
                        type="text"
                        placeholder="Enter your city"
                        className={`w-full rounded-md border ${errors.city ? "border-red-500" : "border-gray-300"
                            } px-3 py-2 text-sm focus:border-black focus:ring-black`}
                        {...register("city", { required: "City is required" })}
                    />
                </ProfileInput>

                <ProfileInput
                    label="State / Province / Region"
                    name="state"
                    error={errors.state?.message}
                >
                    <input
                        id="state"
                        type="text"
                        defaultValue={address?.state || ""}
                        placeholder="Enter your state/province/region"
                        className={`w-full rounded-md border ${errors.state ? "border-red-500" : "border-gray-300"
                            } px-3 py-2 text-sm focus:border-black focus:ring-black`}
                        {...register("state", { required: "State/Province is required" })}
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
                        value="Nigeria"
                        disabled
                        className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                        {...register("country")}
                    />
                </ProfileInput>

                {/* Form Actions */}
                <div className="mt-4 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        // onClick={() => navigate("/account/addresses")}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Update Address'}
                    </button>
                </div>
            </form>
        </div>
    );
}
