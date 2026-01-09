import {
  FiHeart,
  FiHelpCircle,
  FiMapPin,
  FiUser,
  FiUsers,
  FiShoppingBag,
  FiBell,
  FiLock,
  FiClock,
  FiShield,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { useUser } from "../authentication/useUser.js";
import { hasRole } from "../../utils/auth.js";

// ---------- Utility ----------
const cx = (...classes) => classes.filter(Boolean).join(" ");

// ---------- Navigation Items ----------
const navigation = [
  { to: "/settings", label: "Profile", icon: FiUser, end: true },
  {
    to: "/settings/notifications",
    label: "Email & Notification",
    icon: FiBell,
  },
  { to: "/settings/password", label: "Password", icon: FiLock },
  { to: "/settings/orders", label: "My Orders", icon: FiShoppingBag },
  {
    to: "/settings/pending-reviews",
    label: "Pending Reviews",
    icon: FiShoppingBag,
  },
  { to: "/settings/recent", label: "Recently Viewed", icon: FiClock },
  { to: "/settings/addresses", label: "Addresses", icon: FiMapPin },
  { to: "/settings/followed", label: "Followed Designers", icon: FiUsers },
  { to: "/settings/wishlist", label: "Wishlist", icon: FiHeart },
  { to: "/settings/support", label: "Support", icon: FiHelpCircle },
];

// ---------- Sidebar Component ----------
function Sidebar({ isOpen, setIsOpen }) {
  const { user, isLoading } = useUser();

  // Add vendor link conditionally
  const isVendor = hasRole(user, "vendor");
  const isAdmin = hasRole(user, "admin");

  const navItems = [
    ...navigation,
    ...(isVendor
      ? [
          {
            to: "/vendor/dashboard",
            label: "Designer Dashboard",
            icon: FiUsers,
          },
        ]
      : []),
    ...(isAdmin
      ? [{ to: "/admin/dashboard", label: "Admin Dashboard", icon: FiShield }]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={cx(
        "fixed top-20 left-[50%] z-40 translate-x-[-50%]",
        "h-auto w-80",
        "rounded-2xl border-r border-gray-200 bg-white p-6 shadow-lg",
        "md:relative md:top-0 md:h-auto md:w-[264px] md:rounded-2xl md:shadow-none",
      )}
    >
      {/* Settings Title */}
      <h2 className="mb-6 text-lg font-bold tracking-wide text-neutral-800">
        SETTINGS
      </h2>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={handleLinkClick}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-xl px-4 py-2 transition-colors",
                "text-neutral-600 hover:bg-gray-100 hover:text-neutral-900",
                isActive && "bg-black font-semibold text-white",
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="truncate text-base">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
