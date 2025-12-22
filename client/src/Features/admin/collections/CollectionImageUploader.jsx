const CollectionImageUploader = ({ imageUrl }) => {
  return (
    <div className="group relative flex h-72 items-center justify-center overflow-hidden rounded-lg bg-gray-100 shadow-sm">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Collection"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop if the image fails to load
            e.target.src = 'https://via.placeholder.com/800x300/f0f0f0/888888?text=Image+Not+Found';
          }}
        />
      ) : (
        <p className="text-gray-500">No image uploaded</p>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
        <div className="flex space-x-4">
          <button className="rounded-md bg-white px-5 py-2 text-sm font-medium text-gray-800">
            Remove Image
          </button>
          <button className="rounded-md bg-black px-5 py-2 text-sm font-medium text-white">
            Replace Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionImageUploader;
