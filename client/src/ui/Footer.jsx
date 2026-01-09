import {
  FaFacebookF,
  FaInstagram,
  FaChevronRight,
  FaTwitter,
  FaEnvelope,
} from "react-icons/fa";
import { NavLink } from "react-router";
import { useUser } from "../Features/authentication/useUser.js";
import { hasRole } from "../utils/auth.js";

const footerData = {
  logo: {
    src: "/Logo.png", // Ensure this path is correct in your project
    alt: "Stylay",
  },
  socials: [
    { href: "#", icon: FaFacebookF, label: "Facebook" },
    { href: "#", icon: FaInstagram, label: "Instagram" },
    { href: "#", icon: FaTwitter, label: "Twitter" },
    { href: "#", icon: FaEnvelope, label: "Email" },
  ],
  newsletter: {
    placeholder: "Get latest offers to your inbox",
    buttonIcon: FaChevronRight,
  },
  linkColumns: [
    {
      title: "Shop",
      links: [
        { text: "My account", href: "#" },
        { text: "Wishlist", href: "#" },
        { text: "Cart", href: "#" },
      ],
    },
    {
      title: "Information",
      links: [
        { text: "Shipping Policy", href: "#" },
        { text: "Frequently asked", href: "#" },
        { text: "Join Us as Designer", href: "/vendor/apply" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "Privacy Policy", href: "#" },
        { text: "Terms & Conditions", href: "#" },
        { text: "Contact Us", href: "#" },
      ],
    },
  ],
  copyright: "© Stylay plc 2025",
};

function Footer() {
  const { user } = useUser();
  const { logo, socials, newsletter, linkColumns, copyright } = footerData;

  const filteredLinkColumns = linkColumns.map((column) => ({
    ...column,
    links: column.links.filter((link) => {
      if (link.text === "Join Us as Designer") {
        return hasRole(user, "customer");
      }
      return true;
    }),
  }));

  return (
    <footer className="mt-5 bg-neutral-100 px-8 py-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:justify-between">
        {/* Left Section */}
        <div className="flex-1">
          {/* Logo */}
          <NavLink to="/">
            <img src={logo.src} alt={logo.alt} className="mb-6 h-20 w-auto" />
          </NavLink>

          {/* Socials */}
          <div className="mb-6 flex space-x-4">
            {socials.map((social, index) => (
              <button
                key={index}
                type="button"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-black transition-colors hover:bg-neutral-300"
              >
                <social.icon />
              </button>
            ))}
          </div>

          {/* Newsletter */}
          <form className="relative flex max-w-sm">
            <input
              type="email"
              placeholder={newsletter.placeholder}
              className="w-full border-b border-neutral-400 bg-transparent py-2 pr-12 text-sm placeholder-neutral-500 focus:border-black focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="absolute top-1/2 right-0 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-black text-white transition-colors hover:bg-neutral-800"
            >
              <newsletter.buttonIcon />
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {filteredLinkColumns.map((column, index) => (
            <div
              key={index}
              // This applies the specific column span class only to the last item
              className={
                index === filteredLinkColumns.length - 1
                  ? "sm:col-span-2 md:col-span-1"
                  : ""
              }
            >
              <h3 className="mb-3 font-semibold">{column.title}</h3>
              <ul className="space-y-2 text-sm text-neutral-600">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <NavLink
                      to={link.href}
                      className="transition-colors hover:text-black hover:underline"
                    >
                      {link.text}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto mt-5 max-w-7xl border-t border-dashed border-neutral-400 pt-6 text-center text-sm text-neutral-600">
        {copyright}
      </div>
    </footer>
  );
}

export default Footer;
