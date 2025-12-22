import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ListFilter, X } from "lucide-react";
import SearchFilters from "./SearchFilter.jsx";

function SideBarDrawer() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  return (
    <>
      {/* --- MOBILE-ONLY FILTER BUTTON --- */}
      <div className="mb-8 lg:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
        >
          <ListFilter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>

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
                  {/* <h2 className="text-xl font-bold">Filters</h2> */}
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="-mr-2 p-2"
                    aria-label="Close filters"
                  >
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                  <SearchFilters />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SideBarDrawer;
