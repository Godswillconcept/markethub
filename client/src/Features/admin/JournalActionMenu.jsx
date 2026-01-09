import { useState, useRef, useEffect } from "react";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const JournalActionMenu = ({ journalId, onEdit, onDelete, onView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleEdit = () => {
    setIsOpen(false);
    onEdit(journalId);
  };

  const handleViewClick = () => {
    setIsOpen(false);
    if (onView) {
      onView(journalId);
    }
  };

  const handleDeleteClick = () => {
    setIsOpen(false);
    onDelete(journalId);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
          aria-label="Actions"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {isOpen && (
          <div className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none">
            <div className="py-1">
              {onView && (
                <button
                  onClick={handleViewClick}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </button>
              )}
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JournalActionMenu;
