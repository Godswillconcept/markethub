import { ChevronsUpIcon } from "lucide-react";
import { useState } from "react";
// import ChevronIcon from "../icons/ChevronIcon";

const ReviewGroup = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-medium text-black">{title}</h3>
        <ChevronsUpIcon
          className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "mt-4 max-h-96" : "max-h-0"
          }`}
      >
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  );
};

export default ReviewGroup;
