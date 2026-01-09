import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  // Layers,
  ShoppingCart,
  CreditCard,
  MessageSquare,
  BookOpen,
  BellRing,
  Shield,
} from "lucide-react";

export const Menu = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/applications", label: "Application", icon: Users },
  { to: "/admin/vendors", label: "Designers", icon: Store },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/vendor-products", label: "Products", icon: Package },
  // { to: "/admin/collections", label: "Collections", icon: Layers },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/earnings", label: "Earnings & Payments", icon: CreditCard },
  { to: "/admin/feedbacks", label: "Feedback & Support", icon: MessageSquare },
  { to: "/admin/journals", label: "Journals", icon: BookOpen },
  { to: "/admin/notifications", label: "Notification Panel", icon: BellRing },
  { to: "/admin/sub-admins", label: "Admin Management", icon: Shield },
];
