import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const RejectionModal = ({ isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    onSubmit(message);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Reason for Rejection
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* <label
              htmlFor="rejectionMessage"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Response Message *
            </label> */}
            <textarea
              id="rejectionMessage"
              rows={4}
              className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              placeholder="Please provide a reason for rejecting this application..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          <div className="mt-5 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              disabled={!message.trim() || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectionModal;
