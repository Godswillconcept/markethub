import { useState, useEffect } from "react";
import Thumbnail from "./Thumbnail.jsx";

const ProductGallery = ({ thumbnail, images }) => {
  // const category = product;
  // State to track the currently displayed large image.
  // Default to the first image in the array.
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (images && images.length > 0) {
      const initialImage =
        images.find((img) => img.src === thumbnail) || images[0];
      setSelectedImage(initialImage);
    }
  }, [images, thumbnail]);

  // If no images are provided, render nothing.
  if (!images || images.length === 0) {
    return null;
  }

  return (
    // Main container using Flexbox for layout.
    // Default is mobile: flex-col. On large screens (lg): flex-row.
    <div className="flex flex-col gap-4 lg:flex-col">
      {/* Category/Breadcrumb */}
      {/* <div className="text-text-secondary text-sm">
        <a href="/products" className="hover:underline">
          Product Details
        </a>
        <span className="mx-2">/</span>
        <a
          href={`/products/${category.toLowerCase()}`}
          className="hover:underline"
        >
          {category}
        </a>
      </div> */}
      {/* Main Image Display */}
      <div className="flex-1">
        <img
          key={selectedImage?.src} // Add key to force re-render on change for transitions
          src={selectedImage?.src}
          alt={selectedImage?.alt}
          className="border-ui-border animate-fade-in h-[32rem] w-[32rem] rounded-md object-cover"
        />
      </div>

      {/* Thumbnails Container */}
      <div className="flex gap-3 overflow-x-auto p-1 lg:flex-row lg:overflow-x-hidden">
        {images.map((image) => (
          <Thumbnail
            key={image?.src} // Use a unique key for each item in the list
            src={image?.src}
            alt={image?.alt}
            isActive={selectedImage?.src === image?.src}
            onClick={() => setSelectedImage(image)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
