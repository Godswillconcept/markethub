import { formatCurrency } from "../../utils/formatCurrency.js";

export const StatCards = [
  {
    label: "Total Earnings",
    value: formatCurrency(500000),
    delta: "-10% from last month",
  },
  { label: "Completed Payouts", value: 93, delta: "+10% from last month" },
  { label: "Total Products Sold", value: 3280, delta: "+10% from last month" },
];

function VendorStatCard({ label, value, delta }) {
  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-black/5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
        {value}
      </div>
      <div
        className={`mt-1 text-xs ${String(delta).startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}
      >
        {delta}
      </div>
    </div>
  );
}

export default VendorStatCard;
