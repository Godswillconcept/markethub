import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

export default function CustomPhoneInput({
  value,
  onChange,
  className,
  placeholder,
  disabled,
  error,
}) {
  return (
    <div className={className}>
      <PhoneInput
        international
        defaultCountry="NG"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`mt-1 flex w-full items-center rounded-md border bg-white px-4 py-2 ${
          error ? "border-red-500" : "border-gray-300"
        } focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:outline-none`}
        numberInputProps={{
          className:
            "w-full border-none bg-transparent focus:ring-0 outline-none placeholder:text-gray-400",
        }}
      />
    </div>
  );
}
