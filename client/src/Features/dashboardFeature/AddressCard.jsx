import { Link } from "react-router-dom";
import { useDefaultAddress } from "./useDefaultAddress.js";
import { useDeleteAddress } from "./useDeleteAddress.js";

function AddressCard({ addr, selectedId, setSelectedId }) {
    const { deleteAddress, isDeleting } = useDeleteAddress()
    const { setAsDefault } = useDefaultAddress()

    if (!addr) return null;
    const {
        id,
        label,
        address_line,
        city,
        state,
        country,
        phone,
        is_default
    } = addr;


    // Create a formatted address string
    const formattedAddress = `${address_line}, ${city}, ${state}, ${country}`;

    return (
        <div
            key={id}
            className={`flex flex-col items-start justify-between gap-3 rounded-lg border p-4 transition-all sm:flex-row sm:items-center sm:p-5 ${is_default
                ? 'border-black bg-gray-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
        >
            {/* Left Section: Radio + Info */}
            <div className="flex w-full items-start gap-3 sm:items-center">
                <input
                    type="radio"
                    name="address"
                    value={id}
                    checked={is_default}
                    onChange={() => setAsDefault(id)}
                    className="mt-1 h-5 w-5 border-2 border-gray-400 text-black focus:ring-black focus:ring-offset-1 sm:mt-0"
                />
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-neutral-900 sm:text-lg">
                            {label}
                        </p>
                    </div>
                    <p className="text-sm text-neutral-600 sm:text-base">
                        {formattedAddress}
                    </p>
                    <p className="mt-1 text-sm text-neutral-900">
                        Contact -{' '}
                        <span className="font-medium text-blue-900">
                            {phone}
                        </span>
                    </p>
                </div>
            </div>

            {/* Right Section: Actions */}
            <div className="flex items-center gap-4 text-sm font-medium sm:text-base">
                <Link to={`/settings/addresses/edit/${id}`} className="text-neutral-900 hover:underline">Edit</Link>
                <span className="text-gray-400">|</span>
                <button className="text-blue-700 hover:underline" onClick={() => deleteAddress(id)} disabled={isDeleting}>Remove</button>
            </div>
        </div>
    );
}

export default AddressCard;