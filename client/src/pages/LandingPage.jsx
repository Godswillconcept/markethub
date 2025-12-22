import FeaturedSection from "../ui/FeaturedSection.jsx";
import Footer from "../ui/Footer.jsx";
import Header from "../ui/Header.jsx";
import Hero from "../ui/Hero.jsx";
import ProductCarousel from "../ui/ProductCarousel.jsx";
// import { useProducts } from "../Features/productFeatures/useProducts";
import { useNewArrival } from "../Features/productFeatures/useNewArrival.js";
import { useTrendingProducts } from "../Features/productFeatures/useTrendingProducts.js";

function LandingPage() {
  const { data: newArrival, totalItems } = useNewArrival();
  console.log("new arrival", newArrival);
  const { trendingProducts } = useTrendingProducts();

  return (
    <>
      <Header />
      <Hero />
      <ProductCarousel title={"New Arrivals"} newArrival={newArrival} totalItems={totalItems} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" />
      <FeaturedSection trendingProducts={trendingProducts} />
      <Footer />
    </>
  );
}

export default LandingPage;
