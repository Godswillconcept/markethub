import AdminHeader from "./AdminHeader.jsx";
import AdminSideBar from "./AdminSideBar.jsx";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="text-text-primary h-screen overflow-hidden bg-gray-100 font-sans">
      <div className="flex h-full">
        <AdminSideBar />
        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto p-6">
            <div className="mx-auto w-full max-w-[1120px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
