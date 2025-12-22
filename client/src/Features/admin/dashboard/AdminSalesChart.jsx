

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useSalesStats } from "./useSalesStats.js";

export default function AdminSalesChart() {
  const [activeIdx, setActiveIdx] = useState(null);
  const { saleStats, isLoading } = useSalesStats();

  const hasData =
    Array.isArray(saleStats?.data) && saleStats.data.length > 0;

  return (
    <div className="w-full h-80 bg-white p-4 rounded-xl shadow-sm flex items-center justify-center">
      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading sales data...</p>
      ) : !hasData ? (
        <div className="text-center">
          <p className="text-gray-600 font-medium">No sales data available</p>
          <p className="text-gray-400 text-xs">
            Sales chart will appear here once transactions occur.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
          <LineChart
            data={saleStats.data}
            onMouseLeave={() => setActiveIdx(null)}
            onMouseMove={(state) => {
              if (
                state.isTooltipActive &&
                state.activeTooltipIndex !== undefined
              ) {
                setActiveIdx(state.activeTooltipIndex);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E9EE" />
            <XAxis dataKey="month" axisLine={false} tick={{ fill: "#6B7280" }} />
            <YAxis axisLine={false} tick={{ fill: "#6B7280" }} />
            <Tooltip wrapperStyle={{ borderRadius: 8 }} />
            <Line
              type="monotone"
              dataKey="total_sales"
              stroke="#111827"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            {activeIdx !== null && (
              <ReferenceLine
                x={saleStats.data[activeIdx].month}
                stroke="#9CA3AF"
                strokeDasharray="4 4"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
