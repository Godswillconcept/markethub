import { Outlet } from "react-router-dom";
import Header from "../ui/Header.jsx";
import Footer from "../ui/Footer.jsx";
import SideBar from "../ui/SideBar.jsx";
import SideBarDrawer from "../ui/SideBarDrawer.jsx";

function MainLayout() {
  return (
    <div className="bg-white">
      <Header />
      <main className="container mx-auto px-4 py-2 md:px-8 lg:px-12">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="hidden w-62 flex-shrink lg:block">
            <SideBar />
          </div>

          {/* --- Main Content changes here --- */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
      <SideBarDrawer />
    </div>
  );
}

export default MainLayout;
