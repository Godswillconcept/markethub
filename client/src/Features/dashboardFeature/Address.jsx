import { useState } from "react";
// import Placeholder from "./Placeholder";
import { FiPlus } from "react-icons/fi";
import { Link } from "react-router";
import AddressCard from "./AddressCard.jsx";
import { useAddresses } from "./useAddresses.js";

// const addresses = [
//     {
//         id: 1,
//         name: "Bruno Fernandes",
//         address: "11, Buhari place, Akanbi estate, Nigeria.",
//         phone: "(936) 361-0310",
//     },
//     {
//         id: 2,
//         name: "Andre Onana",
//         address: "11, Buhari place, Akanbi estate, Nigeria.",
//         phone: "(936) 361-0310",
//     },
// ];

function Address() {
    const { addresses = [], isLoading, error } = useAddresses();
    const [selectedId, setSelectedId] = useState(null);
    console.log("addressed for all", addresses);


    if (isLoading) {
        return <div className="w-full rounded-2xl bg-white p-8 text-center">Loading addresses...</div>;
    }

    if (error) {
        return <div className="w-full rounded-2xl bg-white p-8 text-red-500">Error loading addresses: {error.message}</div>;
    }

    return (
        <div className="w-full rounded-2xl bg-white p-4 shadow-md sm:p-6 lg:p-8">
            {/* Title */}
            <h2 className="mb-4 text-xl font-bold text-neutral-900 sm:text-2xl">
                Saved Addresses
            </h2>

            {/* Address List */}
            <div className="space-y-4">
                {Array.isArray(addresses) && addresses.length > 0 ? (
                    addresses.map((address) => (
                        <AddressCard
                            key={address.id}
                            addr={address}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                        />
                    ))
                ) : (
                    <p className="text-gray-500">No saved addresses found.</p>
                )}
            </div>

            {/* Add New Address */}
            <Link
                to="/settings/addresses/new"
                className="mt-6 flex items-center gap-2 text-blue-700 hover:underline"
            >
                <FiPlus size={20} />
                <span className="font-medium">Add New Address</span>
            </Link>
        </div>
    );
}

export default Address;
