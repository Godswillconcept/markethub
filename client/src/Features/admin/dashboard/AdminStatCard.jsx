export default function AdminStatCard({ title, value, delta, highlight }) {
  return (
    <div
      className={`rounded-md p-4 ${highlight ? "bg-gradient-to-b from-gray-800 to-gray-200 text-white" : "bg-surface shadow-sm"}`}
    >
      <div className="text-sm font-medium">{title}</div>
      <div
        className={`mt-2 text-lg font-bold ${highlight ? "text-white" : "text-text-primary"}`}
      >
        {value}
      </div>
      {delta && (
        <div
          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs ${delta.startsWith("+") ? "bg-white text-green-600" : "text-red-500"}`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
