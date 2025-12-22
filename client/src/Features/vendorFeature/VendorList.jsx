import VendorCard from "./VendorCard.jsx";
import { useVendors } from "./useVendors.js";
import Pagination from "../../ui/Pagination.jsx";
import { DataState } from "../../ui/DataState.jsx";

function VendorList() {
  const { vendors, isLoading, error, total } = useVendors();

  return (
    <div className="mx-auto min-h-screen max-w-[95%] overflow-hidden rounded-xl shadow-lg lg:p-8">
      <DataState
        isLoading={isLoading}
        isError={!!error}
        error={error}
        isEmpty={!isLoading && !error && vendors?.length === 0}
        emptyMessage="No vendors found."
        loadingMessage="Loading vendors..."
      >
        {/* Grid of cards */}
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 p-4 md:grid-cols-3 xl:grid-cols-4">
          {vendors?.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>

        {/* Pagination Controls */}
        {total > 0 && (
          <div className="mt-8">
            <Pagination count={total} />
          </div>
        )}
      </DataState>
    </div>
  );
}

export default VendorList;
