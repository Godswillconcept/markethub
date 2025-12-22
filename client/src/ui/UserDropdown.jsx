import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { NavLink } from "react-router-dom";
import { BiUser, BiLogOut, BiPackage, BiHome } from "react-icons/bi";
import { MdDashboard } from "react-icons/md";
import { useUser } from "../Features/authentication/useUser.js";
import { useLogout } from "../Features/authentication/useLogout.js";
import { hasRole } from "../utils/auth.js";
import { getPlaceholder } from "../utils/helper.js";
import { getImageUrl } from "../utils/imageUtil.js";

export const DropdownItem = ({ to, onClick, children, className = "", icon: Icon }) => (
  <Menu.Item>
    {({ active }) => {
      const baseClasses = `${active ? "bg-gray-100 text-gray-900" : "text-gray-700"
        } group flex w-full items-center rounded-md px-3 py-2 text-sm ${className}`;

      const content = (
        <>
          {Icon && (
            <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          )}
          {children}
        </>
      );

      return to ? (
        <NavLink to={to} className={baseClasses}>
          {content}
        </NavLink>
      ) : (
        <button onClick={onClick} className={baseClasses} disabled={!onClick}>
          {content}
        </button>
      );
    }}
  </Menu.Item>
);

const UserDropdown = ({ children }) => {
  const { user } = useUser();
  const { logout, isPending } = useLogout();

  if (!user) return null;

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center gap-2 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-black focus:outline-none focus:ring-inset">
            <img
              src={
                getImageUrl(user?.user?.profile_image) ||
                getImageUrl(user?.profile_image) ||
                getPlaceholder(user.first_name, user.last_name)
              }
              alt={`${user.first_name} ${user.last_name}`}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="hidden sm:inline font-medium text-sm text-gray-700">
              {user?.user?.first_name || user?.first_name}
            </span>
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="py-1">
              {children ? (
                children
              ) : (
                <>
                  <DropdownItem to="/" icon={BiHome}>
                    Home
                  </DropdownItem>

                  <DropdownItem to="/settings" icon={BiUser}>
                    My Account
                  </DropdownItem>

                  <DropdownItem to="/settings/orders" icon={BiPackage}>
                    My Orders
                  </DropdownItem>

                  {/* Vendor Dashboard Link */}
                  {hasRole(user, "vendor") && (
                    <DropdownItem to="/vendor/dashboard" icon={MdDashboard}>
                      Vendor Dashboard
                    </DropdownItem>
                  )}

                  {/* Admin Dashboard Link */}
                  {hasRole(user, "admin") && (
                    <DropdownItem to="/admin/dashboard" icon={MdDashboard}>
                      Admin Dashboard
                    </DropdownItem>
                  )}

                  <DropdownItem
                    onClick={logout}
                    icon={BiLogOut}
                    className="text-red-600"
                  >
                    {isPending ? "Logging out..." : "Logout"}
                  </DropdownItem>
                </>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default UserDropdown;
