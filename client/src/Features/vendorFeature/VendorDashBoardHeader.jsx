import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import UserDropdown, { DropdownItem } from "../../ui/UserDropdown.jsx";
import { useLogout } from "../authentication/useLogout.js";
import { BiHome, BiUser, BiLogOut } from "react-icons/bi";

const VendorDashboardHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, isPending } = useLogout();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { name: "Products", to: "/vendor/dashboard" },
    { name: "Earnings", to: "/vendor/dashboard/earnings" },
    { name: "Profile", to: "/vendor/dashboard/profile" },
  ];

  return (
    <>
      {/* Header */}
      <header className="relative z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to={"/"}>
                {" "}
                <div className="rounded-full bg-black px-4 py-2">
                  <span className="text-lg font-bold tracking-tight text-white">
                    Stylay
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-8 md:flex">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.to === "/vendor/dashboard"} // Add end prop for exact matching on the root path
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "border-b-2 border-black pb-1 text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Profile Button */}
            <div className="hidden items-center md:flex">
              <UserDropdown>
                <DropdownItem to="/" icon={BiHome}>
                  Home
                </DropdownItem>
                <DropdownItem to="/settings" icon={BiUser}>
                  Account
                </DropdownItem>
                <DropdownItem
                  onClick={logout}
                  icon={BiLogOut}
                  className="text-red-600"
                >
                  {isPending ? "Logging out..." : "Logout"}
                </DropdownItem>
              </UserDropdown>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 text-gray-600 transition-colors duration-200 hover:text-gray-900 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div
          className="bg-opacity-50 absolute inset-0 bg-black backdrop-blur-sm"
          onClick={closeMobileMenu}
        />

        {/* Slide-in Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="rounded-full bg-black px-3 py-1">
              <span className="text-sm font-bold tracking-tight text-white">
                Stylay
              </span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="rounded-md p-2 text-gray-400 transition-colors duration-200 hover:text-gray-600 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="px-6 py-6">
            <nav className="space-y-1">
              {/* Home and Account links specifically for mobile */}
              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className="group flex items-center rounded-lg px-4 py-3 text-base font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
              >
                <BiHome className="mr-3 h-5 w-5" />
                <span className="truncate">Home</span>
              </NavLink>
              <NavLink
                to="/settings"
                onClick={closeMobileMenu}
                className="group flex items-center rounded-lg px-4 py-3 text-base font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
              >
                <BiUser className="mr-3 h-5 w-5" />
                <span className="truncate">Account</span>
              </NavLink>

              <div className="my-4 border-t border-gray-100" />

              {navigationItems.map((item, index) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={closeMobileMenu}
                  end={item.to === "/vendor/dashboard"}
                  className={({ isActive }) =>
                    `group flex items-center rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
                      isActive
                        ? "border-l-4 border-black bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  style={{
                    animationDelay: `${(index + 2) * 50}ms`,
                    animation: isMobileMenuOpen
                      ? "slideInFromRight 0.3s ease-out forwards"
                      : "none",
                  }}
                >
                  <span className="truncate">{item.name}</span>
                  {item.active && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-black" />
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Panel Footer - Logout */}
          <div className="absolute right-0 bottom-0 left-0 border-t border-gray-200 p-6">
            <button
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
              disabled={isPending}
              className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-600 p-3 text-white transition-colors duration-200 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
            >
              <BiLogOut className="h-5 w-5" />
              <span className="font-medium">
                {isPending ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorDashboardHeader;
