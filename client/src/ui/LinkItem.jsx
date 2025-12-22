import { NavLink } from "react-router-dom";

function LinkItem({ children, href = "#" }) {
  return (
    <li>
      <NavLink
        to={href}
        className={({ isActive }) =>
          `rounded-xl px-4 py-2 text-[18px] font-medium tracking-[0.2px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/50 ${
            isActive
              ? "text-neutral-900"
              : "text-neutral-700 hover:text-neutral-900"
          }`
        }
      >
        {children}
      </NavLink>
    </li>
  );
}

export default LinkItem;
