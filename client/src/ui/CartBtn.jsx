import { BiShoppingBag } from "react-icons/bi";
import { NavLink } from "react-router-dom";

function CartBtn({ count = 0 }) {
  return (
    <NavLink
      to="/cart"
      className="relative flex items-center space-x-2 rounded-full p-1 pr-3"
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
    >
      <img src="cart.png" alt="cart" />
      {/* Count Badge */}
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-600 text-xs font-bold text-white shadow-md">
          {count}
        </span>
      )}
    </NavLink>
  );
}

export default CartBtn;
