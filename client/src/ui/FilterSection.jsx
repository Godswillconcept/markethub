import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FilterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 py-6">
      <h3
        onClick={() => setIsOpen(!isOpen)}
        className="-my-3 flow-root cursor-pointer"
      >
        <div className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-500 hover:text-gray-800">
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="ml-6 flex items-center">
            <ChevronDown
              className={`h-5 w-5 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </span>
        </div>
      </h3>
      {isOpen && <div className="pt-6">{children}</div>}
    </div>
  );
};

export default FilterSection;
