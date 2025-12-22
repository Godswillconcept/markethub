import {
  UserIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function OverallMetrics({ vendor }) {
  const metrics = vendor?.overall_metrics;

  if (!metrics) return null;

  // Select metrics to display
  const data = [
    {
      key: "product_tags_count",
      label: "Products Tagged",
      value: metrics.product_tags_count,
      icon: <UserIcon className="h-6 w-6 text-gray-700" />,
    },
    {
      key: "total_earnings",
      label: "Total Earnings",
      value: metrics.total_earnings,
      icon: <CurrencyDollarIcon className="h-6 w-6 text-gray-700" />,
    },
    {
      key: "total_products",
      label: "Total Products",
      value: metrics.total_products,
      icon: <ClipboardDocumentCheckIcon className="h-6 w-6 text-gray-700" />,
    },
    {
      key: "total_sales",
      label: "Total Sales",
      value: metrics.total_sales,
      icon: <StarIcon className="h-6 w-6 text-gray-700" />,
    },
    {
      key: "total_payouts",
      label: "Total Payouts",
      value: metrics.total_payouts,
      icon: <BanknotesIcon className="h-6 w-6 text-gray-700" />,
    },
    {
      key: "total_views",
      label: "Total Views",
      value: metrics.total_views,
      icon: <EyeIcon className="h-6 w-6 text-gray-700" />,
    },
  ];

  // Mock trend generator (for now)
  const getTrend = (key) => {
    const isUp = Math.random() > 0.5;
    const trendPercent = (Math.random() * 10).toFixed(1); // between 0–10%
    return {
      type: isUp ? "up" : "down",
      percent: trendPercent,
      from: "last month",
    };
  };

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => {
        const trend = getTrend(item.key);

        return (
          <div
            key={item.key}
            className="flex items-start space-x-4 rounded-lg bg-white p-5 shadow-md transition hover:shadow"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
              {item.icon}
            </div>

            <div className="flex-1">
              <p className="mb-1 text-sm text-gray-500">{item.label}</p>
              <p className="mb-1 text-lg font-bold text-gray-900">
                {parseFloat(item.value).toLocaleString()}
              </p>

              <div
                className={`flex items-center text-sm ${
                  trend.type === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.type === "up" ? (
                  <ArrowTrendingUpIcon className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowTrendingDownIcon className="mr-1 h-4 w-4" />
                )}
                <span>
                  {trend.percent}% {trend.type === "up" ? "Up" : "Down"} from{" "}
                  {trend.from}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
