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
import DateRangeFilter from "../../../ui/DateRangeFilter.jsx";
import { useState } from "react";

export default function AdminDashboard() {
  // Date range state with default to current month
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    };
  });

  // Extract year and month from date range
  const year = parseInt(dateRange.startDate.split("-")[0]);
  const month = parseInt(dateRange.startDate.split("-")[1]);

  // Handle date changes
  const handleDateChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const { stats = {}, isLoading, error } = useStats({ year, month });
  const { isLoading: isLoadingOrders } = useRecentOrders();
  const { isLoading: isLoadingSales } = useSalesStats();
  const { isLoading: isLoadingTopItems } = useTopItem({ year, month });
  const { isLoading: isLoadingTopVendor } = useTopVendor({ year, month });
  const { isLoading: isLoadingCategories } = useTopCategories({ year, month });

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
  const { user } = useUser();
  const userData = user?.user || user || {};
  const { first_name, last_name, profile_image } = userData;
  console.log(first_name, last_name, profile_image);

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
          <DateRangeFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Stat cards row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            title="Total Designers"
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
