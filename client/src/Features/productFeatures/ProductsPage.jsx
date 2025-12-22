import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListFilter, X } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { journalEntries } from "../../data/Product.js";
import JournalCard from "../journalsFeature/JournalCard.jsx";
import ProductSet from "../../ui/ProductSet.jsx";
import SideBar from "../../ui/SideBar.jsx";
import { useProducts } from "./useProducts.js";
import Pagination from "../../ui/Pagination.jsx";
import { useNewArrival } from "./useNewArrival.js";
import { useSearchParams } from "react-router";

function ProductsPage() {
  const [searchParams] = useSearchParams();
  // Page is kept for potential future pagination
  const _page = Number(searchParams.get("page")) || 1;

  const { products, total, isLoading, error } = useProducts();
  const { data: newArrival } = useNewArrival();
  console.log("new arrival products", newArrival);

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
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  if (isLoading)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );

  if (error) return <p className="text-center text-red-500">{error.message}</p>;

  return (
    <div className="bg-white">
      <main className="container mx-auto px-4 py-2 md:px-8 lg:px-4">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            {/* Products Section */}
            <section>
              <h1 className="mb-5 text-center text-2xl font-bold">
                ALL PRODUCTS
              </h1>
              <ProductSet products={products} title="" columns={4} />
              <Pagination count={total} />
            </section>

            {/* New Arrivals Section */}
            {newArrival && (
              <section className="mt-12">
                <h2 className="mb-5 text-center text-2xl font-bold">
                  New Arrivals
                </h2>
                <ProductSet products={newArrival} title="" columns={4} />
              </section>
            )}

            {/* Journals Section */}
            <section className="m-4 mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
              <h2 className="text-xl font-bold text-neutral-800">Journals</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 border-t border-neutral-200 pt-10 sm:grid-cols-2 lg:grid-cols-3">
                {journalEntries.map((journal) => (
                  <JournalCard key={journal.id} journal={journal} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={backdropVariants}
              transition={{ duration: 0.3 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              aria-hidden="true"
            />

            {/* Sliding Panel */}
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={sidebarVariants}
              className="fixed top-0 bottom-0 left-0 z-50 w-full max-w-sm bg-white lg:hidden"
              aria-modal="true"
              role="dialog"
            >
              <div className="flex h-full flex-col">
                <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="-mr-2 p-2"
                    aria-label="Close filters"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                  <SideBar />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductsPage;
