import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatDate } from "../../utils/helper.js";
import { useVendorEarnings } from "./useVendorEarnings.js";
import VendorPagination from "../../ui/VendorPagination.jsx";
// import VendorWithdrawModal from "./VendorWithdrawModal";
// StatusPill Component
function StatusPill({ status }) {
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

// StatCard Component
function StatCard({ label, value, delta }) {
  return (
    <div className="rounded-2xl bg-white/90 p-5 shadow-sm ring-1 ring-black/5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">
        {value}
      </div>
      {delta && (
        <div
          className={`mt-1 text-xs ${
            String(delta).startsWith("-") ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

// Field Component
function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

// useBodyScrollLock Hook
function useBodyScrollLock(locked) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const { body } = document;
    const previous = body.style.overflow;

    if (locked) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
    }

    return () => {
      body.style.overflow = previous || "";
    };
  }, [locked]);
}

// WithdrawModal Component
function WithdrawModal({ open, onClose }) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstInputRef = useRef(null);
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    // Focus first input when modal opens
    firstInputRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Trap focus inside modal
      if (e.key === "Tab") {
        const focusableElements =
          panelRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ) || [];

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement withdrawal submission to API
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="flex min-h-screen items-center justify-center p-4">
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              aria-label="Close"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Withdraw Funds
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the amount you'd like to withdraw to your bank account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Amount">
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">₦</span>
                    </div>
                    <input
                      ref={firstInputRef}
                      type="number"
                      name="amount"
                      id="amount"
                      className="block h-10 w-full rounded-md border-gray-300 pr-12 pl-7 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">NGN</span>
                    </div>
                  </div>
                </Field>

                <Field label="Bank Account">
                  <select
                    id="bank"
                    name="bank"
                    className="mt-1 block h-10 w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    required
                  >
                    <option value="">Select a bank account</option>
                    <option value="gtb">GTBank - •••• 4567</option>
                    <option value="zenith">Zenith Bank - •••• 8910</option>
                  </select>
                </Field>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Withdraw
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

// Main Component
export default function VendorEarning() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { earnings, pagination, isLoading } = useVendorEarnings(
    currentPage,
    10,
  );

  useBodyScrollLock(isWithdrawOpen);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalEarnings = useMemo(
    () =>
      earnings.reduce((sum, item) => sum + (parseFloat(item.earnings) || 0), 0),
    [earnings],
  );

  const completedPayouts = useMemo(
    () => earnings.filter((item) => item.status === "Completed").length,
    [earnings],
  );

  const totalUnitsSold = useMemo(
    () => earnings.reduce((sum, item) => sum + (parseInt(item.units) || 0), 0),
    [earnings],
  );

  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(totalEarnings),
      delta: "-10% from last month",
    },
    {
      label: "Completed Payouts",
      value: completedPayouts,
      delta: "+10% from last month",
    },
    {
      label: "Total Products Sold",
      value: totalUnitsSold,
      delta: "+10% from last month",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            Withdraw Funds
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
            />
          ))}
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden bg-white shadow sm:rounded-lg">
          <div className="flex items-center justify-between px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Transactions
            </h2>
            {pagination && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {pagination.totalPages || 1}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200">
            {isLoading ? (
              <div className="px-4 py-12 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading transactions...
                </p>
              </div>
            ) : earnings.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No transactions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by making your first sale.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500">
                      <th className="w-28 px-4 py-3 font-medium">Date</th>
                      <th className="min-w-[280px] px-4 py-3 font-medium">
                        Product
                      </th>
                      <th className="w-40 px-4 py-3 font-medium">Status</th>
                      <th className="w-40 px-4 py-3 font-medium">Earnings</th>
                      <th className="w-32 px-4 py-3 font-medium">Unit Sold</th>
                      <th className="w-40 px-4 py-3 font-medium">
                        Payout Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {earnings.map((r, i) => (
                      <tr key={i} className="align-middle">
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(r.date)}
                        </td>
                        <td className="px-4 py-3">{r.product}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(r.earnings)}
                        </td>
                        <td className="px-4 py-3">{r.units}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(r.payout)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                    currentPage === 1
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    !pagination || currentPage === pagination.totalPages
                  }
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                    !pagination || currentPage === pagination.totalPages
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * 10 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {pagination
                        ? Math.min(currentPage * 10, pagination.totalItems)
                        : 0}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {pagination?.totalItems || 0}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <VendorPagination
                    currentPage={currentPage}
                    totalPages={pagination?.totalPages || 1}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <WithdrawModal
        open={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
    </div>
  );
}
