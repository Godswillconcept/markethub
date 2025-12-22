import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


import Header from "../../ui/Header.jsx";
import SideBar from "../../ui/SideBar.jsx";

import JournalGrid from "../../Features/journalsFeature/JournalGrid.jsx";
import ProductSet from "../../ui/ProductSet.jsx";
import { useSearchParams } from "react-router";
import { useProductsByCategory } from "./useProductByCategory.js";
import { useEffect, useState } from "react";
import Pagination from "../../ui/Pagination.jsx";
import { journalEntries } from "../../data/Product.js";
import JournalCard from "../journalsFeature/JournalCard.jsx";

function KidPage() {
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { products, pagination } = useProductsByCategory(page);

  console.log("data", products);

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

  return (
    <>
      <section>
        <h1 className="mb-5 text-center text-2xl font-bold">Kid</h1>
        {/* <ProductGrid products={products} /> */}
        <ProductSet products={products} title="" columns={4} />
        <Pagination count={pagination.total} />
      </section>

      {/* Journals Section */}
      <section className="m-4 mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
        <h2 className="text-xl font-bold text-neutral-800">Journals</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 border-t border-neutral-200 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {journalEntries.map((journal) => (
            <JournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      </section>
    </>
  );
}

export default KidPage;
