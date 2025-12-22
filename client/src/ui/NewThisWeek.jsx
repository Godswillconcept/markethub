import NewCaro from "./NewCaro.jsx";
import ProductCard from "./ProductCard.jsx";

const products = Array.from({ length: 10 }).map((_, index) => ({
  id: index,
  imageUrl: "/productImg/productImg.png",
  category: "Cotton T Shirt",
  name: `Autumn Knit Sweater ${index + 1}`,
  price: 199,
}));

export default function NewThisWeek() {
  return (
    <section className="relative mx-auto mt-10 w-full max-w-7xl overflow-visible px-4">
      <div className="mb-8 flex items-center justify-between px-2 sm:px-4">
        <h2 className="text-2xl font-bold">New This Week</h2>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
        >
          {/* View more → */}
        </a>
      </div>

      <div className="relative w-full overflow-visible">
        <div className="">
          <NewCaro
            items={products}
            renderItem={(product) => (
              <div className="h-full w-full px-1 sm:px-1.5">
                <ProductCard product={product} className="w-full" />
              </div>
            )}
            loop={true}
            showNav={true}
            showPagination={false}
            spaceBetween={16}
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}
