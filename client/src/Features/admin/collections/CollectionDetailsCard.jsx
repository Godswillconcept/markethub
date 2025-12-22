const CollectionDetailsCard = ({ data }) => {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
        <span className="inline-flex items-center rounded bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
          {data.status}
        </span>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        <p className="mb-1">
          Created On:
          <span className="font-semibold text-gray-800">{data.createdOn}</span>
        </p>
        <p>
          Last Updated:
          <span className="font-semibold text-gray-800">
            {data.lastUpdated}
          </span>
        </p>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-gray-700">Description:</p>
        <div className="rounded-r-md border-l-4 border-gray-200 bg-gray-50 py-2 pl-4 text-gray-700 italic">
          {data.description}
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailsCard;
