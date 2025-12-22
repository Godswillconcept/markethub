function ProfileInput({ label, name, hint, error, children, className }) {
  return (
    <div className={`mb-2 ${className || ""}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-900"
        >
          {label}
        </label>
      )}

      {/* Hint (e.g. address shipping note) */}
      {hint && <p className="-mt-1 mb-2 text-xs text-gray-500">{hint}</p>}

      {/* Input (passed as child) */}
      {children}

      {/* Error */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default ProfileInput;
