// import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import Logo from "./Logo.jsx";
// import FilterButton from "./FilterButton";
import { BiMenu, BiSearch, BiUser, BiX } from "react-icons/bi";
import { FaShoppingCart } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useUser } from "../Features/authentication/useUser.js";
import { useUnifiedCart } from "../Features/cart/useUnifiedCart.js";
import UserDropdown from "./UserDropdown.jsx";
import SearchBox from "./SearchBox.jsx";
import NotificationDropdown from "../components/NotificationDropdown.jsx";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const { user } = useUser();
  console.log("logged in user", user);

  const { cartCount: cartItemCount } = useUnifiedCart();

  // Debug logging for user data
  useEffect(() => {
    console.log("🔍 Header user data:", {
      user,
      profileImage: user?.user?.profile_image || user?.profile_image,
      hasNestedUser: !!user?.user,
      hasDirectUser: !!user?.profile_image,
    });
  }, [user]);

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Men", href: "/categories/men/products" },
    { name: "Women", href: "/categories/women/products" },
    { name: "Kiddies", href: "/categories/kiddies/products" },
    { name: "Designers", href: "/vendors" },
    { name: "Journal", href: "/journals" },
    // ...(hasRole(user, 'admin') ? [{ name: "Admin", href: "/admin-dashboard" }] : []),
    // ...(hasRole(user, 'vendor') ? [{ name: "Vendor Dashboard", href: "/vendor-dashboard" }] : []),
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center">
              {/* Mobile Hamburger Menu */}
              <button
                onClick={toggleMobileMenu}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset lg:hidden"
              >
                <BiMenu className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="mt-[3rem] ml-2 h-[100px] flex-shrink-0 lg:ml-0">
                <Logo />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:ml-10 lg:flex lg:space-x-8">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `px-3 py-2 text-sm font-medium transition-colors duration-200 hover:text-gray-600 ${
                        isActive
                          ? "border-b-2 border-black font-semibold text-black"
                          : "text-gray-900"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search */}
              <SearchBox className="hidden w-64 md:block" />

              {/* Mobile Search Icon */}
              <button
                onClick={toggleSearch}
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset md:hidden"
              >
                <BiSearch className="h-6 w-6" />
              </button>

              {/* Shopping Cart */}
              <NavLink
                to="/cart"
                className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset"
              >
                <FaShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {cartItemCount}
                  </span>
                )}
              </NavLink>

              {/* Notification Dropdown - Only show when user is logged in */}
              {user && <NotificationDropdown />}

              {/* User Account Dropdown */}
              {user ? (
                <UserDropdown />
              ) : (
                <NavLink
                  to="/login"
                  className="flex items-center gap-2 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset"
                >
                  <BiUser className="h-6 w-6 flex-shrink-0" />
                </NavLink>
              )}
            </div>
          </div>

          {/* Mobile Search Expanded */}
          {isSearchExpanded && (
            <div className="px-4 pb-4 md:hidden">
              <SearchBox
                autoFocus
                onProductSelect={() => setIsSearchExpanded(false)}
                className="w-full"
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? "" : "pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={toggleMobileMenu}
        />

        {/* Drawer */}
        <div
          className={`fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] transform bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="text-xl font-bold text-black">Menu</h2>
            {/* <Logo /> */}
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <BiX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `block rounded-md px-4 py-3 text-base font-medium transition-colors duration-200 hover:bg-gray-100 ${
                    isActive ? "font-semibold text-black" : "text-gray-900"
                  }`
                }
                onClick={toggleMobileMenu}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Drawer Footer */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <NavLink
                to="/cart"
                onClick={toggleMobileMenu}
                className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <FaShoppingCart className="mr-2 h-5 w-5" />
                Cart ({cartItemCount > 0 ? cartItemCount : 0})
              </NavLink>
              <button className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <BiUser className="mr-2 h-5 w-5" />
                Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bar (shown only on product pages) */}
      {/* Should be displayed base on condition */}
      {/* <FilterButton /> */}
    </>
  );
};

export default Header;
