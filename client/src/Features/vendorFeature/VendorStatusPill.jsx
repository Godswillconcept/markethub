import { useMemo } from "react";

export default function VendorStatusPill({ status }) {
  const styles = useMemo(() => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
      case "Active":
        return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
      default:
        return "bg-gray-100 text-gray-700 ring-1 ring-gray-200";
    }
  }, [status]);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
}
