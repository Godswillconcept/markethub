import AdminStatCard from "./AdminStatCard.jsx";
import AdminSalesChart from "./AdminSalesChart.jsx";
import RecentOrders from "./RecentOrders.jsx";
import Categories from "./Categories.jsx";
import TopSellingItems from "./TopSellingItems.jsx";
import TopSellingVendor from "./TopSellingVendors.jsx";
import { useStats } from "./useStat.js";
import { useUser } from "../../authentication/useUser.js";
import { getStats } from "../../../services/apiAdmin.js";
import { useRecentOrders } from "./useRecentOrders.js";
import { useSalesStats } from "./useSalesStats.js";
import { useTopItem } from "./useTopItem.js";
import { useTopVendor } from "./useTopVendor.js";
import { useTopCategories } from "./useTopCategories.js";
import Spinner from "../../../ui/Spinner.jsx";

export default function AdminDashboard() {
  const { stats = {}, isLoading, error } = useStats();
  const { isLoading: isLoadingOrders } = useRecentOrders();
  const { isLoading: isLoadingSales } = useSalesStats();
  const { isLoading: isLoadingTopItems } = useTopItem();
  const { isLoading: isLoadingTopVendor } = useTopVendor();
  const { isLoading: isLoadingCategories } = useTopCategories();

  const isGlobalLoading =
    isLoading ||
    isLoadingOrders ||
    isLoadingSales ||
    isLoadingTopItems ||
    isLoadingTopVendor ||
    isLoadingCategories;

  const {
    totalVendors,
    totalProducts,
    totalSales,
    orderStatuses,
    monthlySales,
  } = stats;
  const { user = {} } = useUser();
  const { first_name, last_name, profile_image } = user;

  if (isGlobalLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 xl:grid-cols-[1fr,320px]">
      {/* Left column */}
      <div className="space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">
            Welcome, {first_name} {last_name}!
          </h1>
          {/* controls (filter etc) could be here */}
          <button className="border-muted-border rounded-md border bg-white px-4 py-2 text-sm shadow-sm">
            This Month ▾
          </button>
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            title="Total Vendors"
            value={totalVendors}
            delta="+20% from last month"
            highlight
          />
          <AdminStatCard
            title="Total Products"
            value={totalProducts}
            delta="-10% from last month"
          />
          <AdminStatCard
            title="Total Sales This Month"
            value={monthlySales}
            delta="-10% from last month"
          />
          <AdminStatCard
            title="Pending Orders"
            value={`${orderStatuses?.pending} orders awaiting processing`}
          />
        </div>

        {/* Top Row: Sales Chart and Top Selling Items */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Sales Chart - Takes 2/3 width on large screens */}
          <div className="bg-surface rounded-md bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Sales Statistics</h2>
            <div style={{ height: 285 }}>
              <AdminSalesChart />
            </div>
          </div>

          {/* Top Selling Items - Takes 1/3 width on large screens */}
          <div className="space-y-4">
            <TopSellingItems />
            <TopSellingVendor />
          </div>
        </div>

        {/* Main content area with Recent Orders and Top Categories side by side */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <RecentOrders />
          </div>
          <div className="space-y-6">
            {/* Top Categories Section */}
            <Categories />
          </div>
        </div>
      </div>
    </div>
  );
}
