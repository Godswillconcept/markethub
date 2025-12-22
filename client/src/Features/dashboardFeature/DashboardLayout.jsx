import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./SideBar.jsx";
import { FiMenu, FiX } from "react-icons/fi";
import Header from "../../ui/Header.jsx";
import Footer from "../../ui/Footer.jsx";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <AnimatePresence>
          {/* Backdrop for mobile (remains the same) */}
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          {/* Header (remains the same) */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-tight text-black sm:text-2xl">
              Profile
            </h1>
            <button
              className="rounded-lg border border-gray-300 bg-white p-2 shadow-sm md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={20} />
            </button>
          </div>

          {/* Layout */}
          <div className="relative flex flex-col md:flex-row md:gap-6">
            {/* Sidebar Container */}
            {/* UPDATED: Added rounded-r-2xl for the off-canvas effect */}
            <div
              className={`sticky inset-y-0 top-0 left-0 z-40 transform transition-transform duration-300 md:relative md:w-[264px] md:translate-x-0 md:rounded-2xl ${
                sidebarOpen
                  ? "translate-x-0 rounded-r-2xl"
                  : "-translate-x-full"
              }`}
            >
              {/* The simplified Sidebar component is placed inside */}
              {/* We pass the setIsOpen function to handle auto-closing on link clicks */}
              <Sidebar setIsOpen={setSidebarOpen} />

              {/* Close button for mobile, positioned relative to this container */}
              <button
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-800 md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Content (remains the same) */}
            <div className="flex-1">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default DashboardLayout;
