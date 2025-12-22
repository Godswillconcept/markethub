import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";

const StatCard = ({ title, value, trend, isPositive }) => {
  return (
    <div className="flex h-full flex-col justify-between rounded-lg bg-white p-6 shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex-1">
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
      <div className="mt-2 flex items-center text-sm">
        {isPositive ? (
          <ArrowUpIcon className="mr-1 h-4 w-4 shrink-0 text-green-500" />
        ) : (
          <ArrowDownIcon className="mr-1 h-4 w-4 shrink-0 text-red-500" />
        )}
        <span className={isPositive ? "text-green-600" : "text-red-600"}>
          {trend}
        </span>
      </div>
    </div>
  );
};

const CollectionStatsGrid = ({ stats }) => {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex h-full">
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default CollectionStatsGrid;
