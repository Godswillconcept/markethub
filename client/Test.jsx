import {
  FiBell,
  FiClock,
  FiHeart,
  FiHelpCircle,
  FiLock,
  FiMapPin,
  FiTruck,
  FiUser,
  FiUsers,
  FiChevronLeft,
} from "react-icons/fi";
import { NavLink } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

// ---------- Utility ----------
const cx = (...classes) => classes.filter(Boolean).join(" ");

// ---------- Nav Items ----------
const navItems = [
  { to: "/settings/profile", label: "Profile", icon: FiUser },
  {
    to: "/settings/notifications",
    label: "Email & Notification",
    icon: FiBell,
  },
  { to: "/settings/password", label: "Password", icon: FiLock },
  { to: "/settings/orders", label: "Order history & tracking", icon: FiTruck },
  { to: "/settings/recent", label: "Recently Viewed", icon: FiClock },
  { to: "/settings/addresses", label: "Saved Addresses", icon: FiMapPin },
  { to: "/settings/followed", label: "Followed Vendors", icon: FiUsers },
  { to: "/settings/wishlist", label: "Wishlist", icon: FiHeart },
  { to: "/settings/support", label: "Support", icon: FiHelpCircle },
];

// ---------- Sidebar ----------
function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 rounded-full border bg-white p-2 shadow md:hidden"
      >
        <FiChevronLeft
          className={cx("transition-transform", open ? "" : "rotate-180")}
        />
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Sidebar Content */}
            <motion.aside
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className={cx(
                "fixed top-0 left-0 z-40 h-full w-64",
                "rounded-r-2xl border-r border-gray-200 bg-red-500 p-4 shadow-lg",
                "md:relative md:top-6 md:h-auto md:w-[264px] md:rounded-2xl md:shadow-sm",
                "md:translate-x-0",
              )}
            >
              <h2 className="mb-3 px-2 text-sm font-semibold text-gray-600">
                Settings
              </h2>
              <nav className="flex flex-col gap-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => window.innerWidth < 768 && setOpen(false)}
                    className={({ isActive }) =>
                      cx(
                        "flex items-center gap-3 rounded-xl px-4 py-2 transition-colors",
                        "text-gray-700 hover:bg-gray-50",
                        isActive && "bg-black font-semibold text-white",
                      )
                    }
                  >
                    <Icon className="shrink-0 text-gray-600" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
