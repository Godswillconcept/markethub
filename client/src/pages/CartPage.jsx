import Footer from "../ui/Footer.jsx";
import { Outlet } from "react-router";
import Header from "../ui/Header.jsx";

function CartPage() {
  return (
    <>
      <Header />
      <div>
        <div className="mt-8 mb-5">
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default CartPage;
