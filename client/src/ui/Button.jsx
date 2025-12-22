import clsx from "clsx"; // A utility for conditionally joining class names

/**
 * A reusable Button component with customizable variants
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant="primary"] - Button style variant (primary, secondary)
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click event handler
 * @param {Object} [props.rest] - Additional HTML button props
 */
const Button = ({
  children,
  variant = "primary",
  className,
  onClick,
  ...rest
}) => {
  const baseStyles =
    "py-2 px-4 rounded-md font-medium text-center transition-all duration-200 flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-secondary-bg text-text-reversed bg-gray-300 border border-secondary-bg",
    secondary:
      "bg-primary-bg text-text-primary border border-ui-border hover:border-text-primary",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
