// function ToggleField({ label, checked, onChange }) {
//   return (
//     <label className="flex cursor-pointer items-start gap-3">
//       <div className="relative inline-flex items-center">
//         <input
//           type="checkbox"
//           checked={checked}
//           onChange={onChange}
//           className="peer sr-only"
//         />
//         <div className="h-6 w-10 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600"></div>
//         <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
//       </div>
//       <span className="text-sm text-gray-700">{label}</span>
//     </label>
//   );
// }

// export default ToggleField;

// import React from "react";
// import { FiCheck } from "react-icons/fi"; // Using an icon for the checkmark

// function ToggleField({ label, checked, onChange }) {
//   return (
//     <label className="flex cursor-pointer items-center gap-3">
//       {/* Switch */}
//       <div className="relative inline-flex h-6 w-11 shrink-0 items-center">
//         <input
//           type="checkbox"
//           checked={checked}
//           onChange={onChange}
//           className="peer sr-only"
//         />
//         {/* Track */}
//         <div className="h-6 w-11 rounded-full bg-red-300 transition-colors peer-checked:bg-blue-600"></div>
//         {/* Thumb */}
//         <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></div>
//       </div>

//       {/* Label */}
//       <span className="text-sm text-gray-700">{label}</span>
//     </label>
//   );
// }

// export default ToggleField;

import React from "react";

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      {/* Switch */}
      <div className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        {/* Background track (gray by default) */}
        <div className="absolute h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600"></div>

        {/* White thumb */}
        <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 peer-checked:translate-x-5"></div>
      </div>

      {/* Label */}
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default ToggleField;
