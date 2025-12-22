// import { useLocation } from "react-router-dom";
import { LuListFilter } from "react-icons/lu";

function FilterButton() {

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <button className="transform-translate-x-1/2 fixed bottom-6 left-1/2 z-50 flex items-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800">
          <LuListFilter className="mr-2 h-4 w-4" />
          Filter
        </button>
      </div>
    </div>
  );
}

export default FilterButton;
