import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid"; // For trend icons
import { CurrencyDollarIcon } from "@heroicons/react/24/outline"; // Example for "View all" icon

const EarningsStatCard = ({
  title,
  value,
  trend,
  isPositive,
  action,
  link,
  variant,
}) => {
  const isDarkVariant = variant === "dark";

  return (
    <div
      className={`rounded-lg p-6 shadow-sm ${isDarkVariant ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
    >
      <h3
        className={`text-base font-medium ${isDarkVariant ? "text-gray-300" : "text-gray-500"} mb-2`}
      >
        {title}
      </h3>
      <p
        className={`text-3xl font-bold ${isDarkVariant ? "text-white" : "text-gray-900"} mb-4`}
      >
        {value}
      </p>

      {trend && (
        <div className="mb-4 flex items-center text-sm">
          {isPositive !== undefined &&
            (isPositive ? (
              <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
            ))}
          <span
            className={`${isPositive ? "text-green-600" : "text-red-600"} ${isDarkVariant ? "rounded-md bg-gray-700 px-2 py-0.5" : ""}`}
          >
            {trend}
          </span>
        </div>
      )}

      {action && link && (
        <a
          href={link}
          className={`inline-flex items-center text-sm font-medium ${isDarkVariant ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}
        >
          {action}
          {/* Example icon, replace with specific design icon */}
          <CurrencyDollarIcon className="ml-1 h-4 w-4" />
        </a>
      )}
    </div>
  );
};

export default EarningsStatCard;
