import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTopCategories } from "./useTopCategories.js";
import { useState } from "react";
import DateRangeFilter from "../../../ui/DateRangeFilter.jsx";

function Categories() {
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

  const {
    topCategories = [],
    isLoading,
    error,
  } = useTopCategories({ year, month });

  // 🔸 Predefined color palette (shades of orange)
  const colors = ["#FEE8E2", "#FF6B3E", "#d74218", "#b42b05", "#6e1802"];

  // 🔸 Transform backend data → Recharts format
  const chartData = topCategories
    .sort((a, b) => b.total_sold - a.total_sold) // sort by sold units descending
    .slice(0, 5) // pick top 5
    .map((cat, index) => ({
      title: cat.name,
      value: cat.total_sold, // can also use total_revenue if preferred
      color: colors[index % colors.length], // loop through colors
    }));

  // 🔸 Compute total for percentages
  const totalValue = chartData.reduce((sum, c) => sum + c.value, 0);

  if (isLoading)
    return (
      <div className="p-4 text-center text-gray-500">Loading categories...</div>
    );
  if (error)
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load categories.
      </div>
    );

  return (
    <div className="">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-2">
        <div className="rounded-lg bg-white p-4 shadow-md">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">
              Top Categories
            </h2>
            <DateRangeFilter
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateChange}
            />
          </div>

          {/* Growth Indicator */}
          <div className="mb-4 flex items-center">
            <div className="flex items-center justify-center rounded border text-green-600">
              <ArrowTrendingUpIcon className="h-3 w-3" />
            </div>
            <span className="ml-2 text-xs font-medium text-green-600">34%</span>
            <span className="ml-1 text-sm text-gray-500">(+20,904)</span>
          </div>

          {/* Chart and List */}
          <div className="flex flex-col items-center">
            {/* Pie Chart */}
            <div className="mb-8 w-full" style={{ height: "250px" }}>
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={300}
                minHeight={200}
              >
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${props.payload.title}: ${value} sold (${(
                        (props.payload.value / totalValue) *
                        100
                      ).toFixed(1)}%)`,
                      props.payload.title,
                    ]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="w-full max-w-md">
              <ul className="space-y-4">
                {chartData.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-gray-700"
                  >
                    <div className="flex items-center">
                      <span
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span className="truncate text-base">{item.title}</span>
                    </div>
                    <span className="font-medium text-gray-800">
                      {item.value.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
