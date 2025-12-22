const CollectionDetailsTable = ({ products }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-bold text-gray-900">
        Products In This Collection
      </h2>

      <div className="overflow-x-auto">
        {/* Handles horizontal scrolling on smaller screens */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Product Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Vendor
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Stock
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              >
                Quantity
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {product.vendor}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {product.stock}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {product.price}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                  {product.quantity}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                  <button className="text-red-600 hover:text-red-900">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollectionDetailsTable;
