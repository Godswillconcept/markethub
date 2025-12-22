import { ChevronDown, MapPin } from "lucide-react";

const LocationSelector = () => (
  <div className="hidden items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 focus-within:ring-2 focus-within:ring-black md:flex">
    <MapPin className="h-5 w-5 text-gray-400" />
    <input
      type="text"
      placeholder="Enter location"
      className="flex-1 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
    />
    <ChevronDown className="h-4 w-4 text-gray-400" />
  </div>
);
export default LocationSelector;
