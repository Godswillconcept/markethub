// function Checkbox({ label, name, checked, required }) {
//   return (
//     <div className="flex items-start mb-4">
//       <input
//         type="checkbox"
//         id={name}
//         name={name}
//         checked={checked}
//         className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//       />
//       <label htmlFor={name} className="ml-2 text-sm text-gray-700">
//         {label}
//         {required && <span className="text-red-500">*</span>}
//       </label>
//     </div>
//   );
// }
function Checkbox({ label, name, register, error }) {
  return (
    <div className="mb-4 flex items-center">
      <input
        id={name}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        {...register}
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default Checkbox;
