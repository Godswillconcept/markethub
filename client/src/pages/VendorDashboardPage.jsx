import VendorDashboardHeader from "../Features/vendorFeature/VendorDashBoardHeader.jsx";
import Footer from "../ui/Footer.jsx";
import { Outlet } from "react-router-dom";

export default function VendorDashboardPage() {
  return (
    <div>
      <VendorDashboardHeader />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* This is where nested routes (product, earning, etc.) will render */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
