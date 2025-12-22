import ProductCard from "./ProductCard.jsx";

function ProductSet({
  title = "You May Also Like",
  products = [],
  showViewMore = true,
  onViewMore,
  columns = 5, // Default to 5 columns
}) {
  return (
    <section className="mx-auto w-full max-w-7xl">
      {/* Title */}
      {title && (
        <h2 className="p-3.5 text-2xl font-bold tracking-widest text-neutral-800">
          {title}
        </h2>
      )}

      {/* Products */}
      <div className={`grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-5'}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View More Button */}
      {/* {showViewMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onViewMore}
            className="cursor-pointer font-semibold text-neutral-700 hover:text-black"
          >
            View more
          </button>
        </div>
      )} */}
    </section>
  );
}

export default ProductSet;
