import ProductCard from "../../ui/ProductCard.jsx";

const dummyProducts = [
  {
    id: 1,
    category: "Cotton T Shirt",
    name: "Full Sleeve Zipper",
    price: 199,
    imageUrl: "/productImg/productImg2.png",
    inStock: true,
  },
  {
    id: 2,
    category: "Sweatshirt",
    name: "Essential Crewneck",
    price: 120,
    imageUrl: "/productImg/productImg5.png",
    inStock: true,
  },
  {
    id: 3,
    category: "Sweatshirt",
    name: "Essential Crewneck",
    price: 120,
    imageUrl: "/productImg/productImg6.png",
    inStock: false,
  },
  {
    id: 4,
    category: "Men's Formal",
    name: "Classic Business Set",
    price: 350,
    imageUrl: "/productImg/productImg7.png",
    inStock: true,
  },
  {
    id: 5,
    category: "Outerwear",
    name: "Vibrant Windbreaker",
    price: 250,
    imageUrl: "/productImg/productImg8.png",
    inStock: false,
  },

  {
    id: 6,
    category: "Cotton T Shirt",
    name: "Full Sleeve Zipper",
    price: 199,
    imageUrl: "/productImg/productImg9.png",
    inStock: true,
  },
  {
    id: 7,
    category: "Sweatshirt",
    name: "Essential Crewneck",
    price: 120,
    imageUrl: "/productImg/productImg10.png",
    inStock: false,
  },
  {
    id: 8,
    category: "Sweatshirt",
    name: "Essential Crewneck",
    price: 120,
    imageUrl: "/productImg/productImg11.png",
    inStock: true,
  },
  {
    id: 9,
    category: "Men's Formal",
    name: "Classic Business Set",
    price: 350,
    inStock: true,
    imageUrl: "/productImg/productImg12.png",
  },
  {
    id: 10,
    category: "Outerwear",
    name: "Vibrant Windbreaker",
    price: 250,
    inStock: false,
    imageUrl: "/productImg/productImg13.png",
  },
];

function MayLike() {
  return (
    <section>
      <h2 className="p-3.5 text-2xl font-bold tracking-widest text-neutral-800">
        You May Also Like
      </h2>
      <div className="flex flex-wrap">
        {dummyProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <button className="font-semibold text-neutral-700 hover:text-black">
          View more
        </button>
      </div>
    </section>
  );
}

export default MayLike;
