// import {
//   ChevronDownIcon,
//   CalendarDaysIcon,
//   ArrowTrendingUpIcon,
// } from "@heroicons/react/24/outline";
// import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// import { useTopCategories } from "./useTopCategories";

// function Categories() {
//   const { topCategories, isLoading, error } = useTopCategories();
//   const chartData = [
//     { title: "Men's Shirt", value: 121799, color: "#FEE8E2" }, // Lightest orange, adjusted from image
//     { title: "Men's wear", value: 66734, color: "#FF6B3E" }, // Slightly darker orange
//     { title: "Bracelet", value: 21567, color: "#d74218" }, // Medium orange
//     { title: "Cargo", value: 11387, color: "#b42b05" }, // Darker orange
//     { title: "Pants", value: 7806, color: "#6e1802" }, // Darkest orange, adjusted from image
//   ];

//   // Calculate total for percentage calculation in legend
//   const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);

//   return (
//     <div className="">
//       <div className="mx-auto max-w-7xl sm:px-6 lg:px-2">
//         <div className="rounded-lg bg-white p-2 shadow-md">
//           {/* Header */}
//           <div className="mb-2 flex items-center justify-between">
//             <h2 className="text-base font-semibold text-gray-800">
//               Top Categories
//             </h2>
//             <button className="flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
//               <CalendarDaysIcon className="mr-2 h-5 w-5 text-gray-500" />
//               This Month
//               <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-500" />
//             </button>
//           </div>

//           {/* Growth Indicator */}
//           <div className="mb-2 flex items-center">
//             <div className="flex items-center justify-center rounded border text-green-600">
//               <ArrowTrendingUpIcon className="h-3 w-3" />
//             </div>
//             <span className="ml-2 text-xs font-medium text-green-600">34%</span>
//             <span className="ml-1 text-sm text-gray-500">(+20,904)</span>
//           </div>

//           {/* Chart and Categories */}
//           <div className="flex flex-col items-center">
//             {/* Pie Chart */}
//             <div className="mb-8 w-full" style={{ height: '250px' }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <RechartsPieChart>
//                   <Pie
//                     data={chartData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={60}
//                     outerRadius={80}
//                     paddingAngle={0}
//                     dataKey="value"
//                     label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
//                     labelLine={false}
//                   >
//                     {chartData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
//                     ))}
//                   </Pie>
//                   <Tooltip
//                     formatter={(value, name, props) => [
//                       `${name}: ${value} (${(props.payload.percent * 100).toFixed(1)}%)`,
//                       props.name
//                     ]}
//                   />
//                 </RechartsPieChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Category List */}
//             <div className="w-full max-w-md">
//               <ul className="space-y-4">
//                 {chartData.map((item, index) => (
//                   <li
//                     key={index}
//                     className="flex items-center justify-between text-gray-700"
//                   >
//                     <div className="flex items-center">
//                       <span
//                         className="mr-3 h-3 w-3 rounded-full"
//                         style={{ backgroundColor: item.color }}
//                       ></span>
//                       <span className="text-base">{item.title}</span>
//                     </div>
//                     <span className="font-medium text-gray-800">
//                       {item.value.toLocaleString()}
//                     </span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Categories;

import {
  ChevronDownIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTopCategories } from "./useTopCategories.js";

function Categories() {
  const { topCategories = [], isLoading, error } = useTopCategories();

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
            <button className="flex items-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <CalendarDaysIcon className="mr-2 h-5 w-5 text-gray-500" />
              This Month
              <ChevronDownIcon className="ml-2 h-4 w-4 text-gray-500" />
            </button>
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
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    label={({ percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
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
