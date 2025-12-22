import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// Your existing imports
import Footer from "../../ui/Footer.jsx";
import Header from "../../ui/Header.jsx";
import SideBar from "../../ui/SideBar.jsx";
import { journalEntries } from "../../data/Product.js";
import JournalGrid from "../journalsFeature/JournalGrid.jsx";
import ProductSet from "../../ui/ProductSet.jsx";
import { useSearchParams } from "react-router";
import { useProductsByCategory } from "./useProductByCategory.js";
import Pagination from "../../ui/Pagination.jsx";
import { useEffect, useState } from "react";
import JournalCard from "../journalsFeature/JournalCard.jsx";

// const { categoryId } = useParams();
// console.log(categoryId);
// // const { productz, isLoading, error } = useCategoryProducts(categoryId);
// const { data = {}, isLoading, isError, error } = useCategoryProducts(categoryId);
// const { products, pagination, category } = data;
// console.log(data);
function MenPage() {

  // State to manage the visibility of the mobile sidebar drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Effect to lock the body scroll when the sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto"; // Cleanup on component unmount
    };
  }, [isSidebarOpen]);

  // Framer Motion variants for the animations
  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const sidebarVariants = {
    visible: {
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    hidden: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { products, pagination, category, isLoading, error } = useProductsByCategory(page);

  if (isLoading) return <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full" />
  </div>
  if (error) return <p className="text-center text-red-500">{error.message}</p>;

  // const category = data?.category;
  // const products = data?.products || [];
  // const pagination = data?.pagination || { total: 0 };
  // console.log(products);


  return (
    <>
      <section>
        {/* Products Section */}
        <section>
          <h1 className="mb-5 text-center text-2xl font-bold">{(category || 'Men').toUpperCase()}</h1>
          <ProductSet products={products} title="" columns={4} />
          <Pagination count={pagination.total} />
        </section>

        {/* New this week Section*/}
        {/* <NewThisWeek /> */}

        {/* Journals Section */}
        <section className="m-4 mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-neutral-800">Journals</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 border-t border-neutral-200 pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {journalEntries.map((journal) => (
              <JournalCard key={journal.id} journal={journal} />
            ))}
          </div>
        </section>
      </section>
      {/* New this week Section*/}
      {/* <NewThisWeek /> */}
    </>
  );
}

export default MenPage;
