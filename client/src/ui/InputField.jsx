function InputField({ label, name, children, error }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <span className="mt-1 text-xs text-red-600" id={`${name}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export default InputField;
