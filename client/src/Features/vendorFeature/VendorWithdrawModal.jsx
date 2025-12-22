import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock.js";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium tracking-wide text-gray-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function VendorWithdrawModal({ open, onClose }) {
  const panelRef = useRef(null);
  const firstFocusable = useRef(null);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const node = panelRef.current;
    if (!node) return;

    // Auto-focus first input
    const first = node.querySelector(
      "input, button, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    if (first) first.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusables = node.querySelectorAll(
          "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
        );
        const list = Array.from(focusables);
        if (list.length === 0) return;
        const firstEl = list[0];
        const lastEl = list[list.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay: intentionally light (not too dark) with tiny blur */}
        <div
          className="absolute inset-0 bg-black/35 backdrop-blur-[1.5px]"
          onMouseDown={onClose}
          aria-hidden
        />

        {/* Panel */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-title"
          className="relative z-10 w-[680px] max-w-[92vw] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
          initial={{ scale: 0.98, y: 8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.98, y: 8, opacity: 0 }}
          ref={panelRef}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between">
            <div className="w-full text-center">
              <h2
                id="withdraw-title"
                className="text-xl font-semibold text-gray-900"
              >
                Withdraw
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Kindly provide the information below.
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-black/5 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
              aria-label="Close"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // You can wire your submit handler here
              onClose();
            }}
            className="space-y-4"
          >
            <Field label="Full Name">
              <input
                ref={firstFocusable}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                placeholder="Give us your full name"
              />
            </Field>

            <Field label="BANK NAME">
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                placeholder="e.g. Access Bank"
              />
            </Field>

            <Field label="BANK ACCOUNT NUMBER">
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                placeholder="0123456789"
                inputMode="numeric"
                maxLength={10}
              />
            </Field>

            <Field label="Amount">
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-300 focus:ring-2 focus:ring-gray-300 focus:outline-none"
                placeholder="Enter amount"
                inputMode="numeric"
              />
            </Field>

            <button
              type="submit"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-700 text-sm font-medium text-white shadow-sm ring-1 ring-black/10 hover:from-neutral-900 hover:to-neutral-800 focus:ring-2 focus:ring-neutral-400 focus:outline-none"
            >
              Submit
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export default VendorWithdrawModal;
