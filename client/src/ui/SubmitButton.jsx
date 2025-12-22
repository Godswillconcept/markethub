// const SubmitButton = ({ label, ...props }) => {
//   return (
//     <button
//       type="submit"
//       className="w-full py-3 mt-4 bg-black text-white font-semibold rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-200"
//       {...props}
//     >
//       {label}
//     </button>
//   );
// };

// export default SubmitButton;
import React from "react";
import clsx from "clsx";

const SubmitButton = ({ label, variant = "black", className, ...props }) => {
  const baseClasses =
    "w-full py-3 mt-2 font-semibold rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors";

  const variants = {
    black: "bg-black text-white hover:bg-gray-800 focus:ring-indigo-200",
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-200",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200",
    google:
      "bg-white border text-gray-700 hover:bg-gray-50 focus:ring-indigo-200 flex items-center justify-center gap-2",
  };

  return (
    <button
      type="submit"
      className={clsx(baseClasses, variants[variant], className)}
      {...props}
    >
      {label}
    </button>
  );
};

export default SubmitButton;
