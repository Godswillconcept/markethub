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
  color, // Hex code for color variants
  isActive = false, 
  isDisabled = false,
  onClick 
}) => {
  const displayLabel = label || value;
  const isColor = !!color || type.toLowerCase() === 'color';

  const baseStyles = [
    'flex items-center justify-center min-w-[48px] h-12 p-2',
    'border rounded-md transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent',
  ];

  /* 
     If it's NOT a color, we treat it as a text label (like size).
  */
  const typeStyles = isColor
    ? [
        'border-2',
        isActive && 'ring-2 ring-offset-2 ring-accent',
        !isDisabled && 'cursor-pointer',
      ]
    : [
        'text-text-primary bg-primary-bg',
        isActive && 'bg-accent text-text-reversed border-accent',
        !isDisabled && 'hover:border-accent cursor-pointer',
      ];
      
  const disabledStyles = isDisabled ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 decoration-slice line-through' : '';

  // For color swatches that are disabled, we might want a different look (e.g. X overlay or just opacity)
  const colorStyle = isColor ? { backgroundColor: color || value } : {};
  if (isColor && isDisabled) {
      // maybe add a diagonal line or just dim it? Opacity handles it well enough usually.
  }

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={clsx(
        baseStyles,
        typeStyles,
        disabledStyles,
        isActive && !isDisabled && 'border-accent',
      )}
      style={colorStyle}
      aria-label={`Select ${type}: ${displayLabel}`}
      aria-pressed={isActive}
      aria-disabled={isDisabled}
      title={isDisabled ? "Not available with current selection" : displayLabel}
    >
      {!isColor && displayLabel}
    </button>
  );
};

Swatch.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  label: PropTypes.string,
  color: PropTypes.string,
  isActive: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export default Swatch;
