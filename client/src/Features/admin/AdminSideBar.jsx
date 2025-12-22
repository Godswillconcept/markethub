import { NavLink, useNavigate } from "react-router-dom";
import { Menu } from "./AdminMenu.jsx";
import { useState, useEffect } from "react";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import Logo from "../../ui/Logo.jsx";
import { useLogout } from "../../Features/authentication/useLogout.js";

export default function AdminSideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useLogout();
  const { navigate } = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed") === "true";
    setCollapsed(saved);
  }, []);
  useEffect(
    () => localStorage.setItem("sidebar-collapsed", collapsed),
    [collapsed],
  );

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-[260px]"} bg-sidebar border-muted-border transition-width duration-200`}
    >
      <div className="flex min-h-screen flex-col bg-white p-4 shadow">
        <div className="mb-6 flex items-center justify-between">
          <div className={`${collapsed ? "text-xs" : "text-2xl font-bold"}`}>
            <Logo />
          </div>
          <button
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-1 hover:bg-gray-100"
          >
            <span className="sr-only">Toggle sidebar</span>☰
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {Menu.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                  isActive
                    ? "bg-black text-white shadow"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {l.icon ? (
                <l.icon className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5" />
              )}
              {!collapsed && <span>{l.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-2 mb-48">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-50"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
