import clsx from "clsx";
import PropTypes from 'prop-types';

/**
 * Swatch component for displaying and selecting product variants
 * @param {Object} props - Component props
 * @param {'size'|'color'} [props.type='size'] - Type of swatch (size or color)
 * @param {string} props.value - The value of the swatch
 * @param {string} [props.label] - Display label (falls back to value if not provided)
 * @param {boolean} [props.isActive=false] - Whether the swatch is currently selected
 * @param {Function} props.onClick - Click handler
 */
const Swatch = ({ 
  type = 'size', 
  value, 
  label, 
  isActive = false, 
  onClick 
}) => {
  const displayLabel = label || value;

  const baseStyles = [
    'flex items-center justify-center min-w-[48px] h-12 p-2',
    'border rounded-md cursor-pointer transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  const typeStyles = {
    size: [
      'text-text-primary bg-primary-bg',
      isActive && 'bg-accent text-text-reversed border-accent',
    ],
    color: [
      'border-2',
      isActive && 'ring-2 ring-offset-2 ring-accent',
    ],
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        baseStyles,
        typeStyles[type],
        isActive && 'border-accent',
      )}
      style={type === 'color' ? { backgroundColor: value } : {}}
      aria-label={`Select ${type}: ${displayLabel}`}
      aria-pressed={isActive}
    >
      {type === 'size' && displayLabel}
    </button>
  );
};

Swatch.propTypes = {
  type: PropTypes.oneOf(['size', 'color']),
  value: PropTypes.string.isRequired,
  label: PropTypes.string,
  isActive: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default Swatch;
