const ReviewCheckbox = ({ id, label, checked, onChange, children }) => (
  <label htmlFor={id} className="flex cursor-pointer items-center gap-2 py-1">
    <input
      id={id}
      type="checkbox"
      className="sr-only" // Hide default checkbox
      checked={checked}
      onChange={onChange}
    />
    <div className="h-5 w-5 flex-shrink-0 rounded-sm border border-gray-400 transition-colors">
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full text-orange-400"
        >
          <path
            fillRule="evenodd"
            d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
    <span className="ml-3 text-gray-300 transition-colors">
      {children || label}
    </span>
  </label>
);

export default ReviewCheckbox;
