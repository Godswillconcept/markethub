import PropTypes from 'prop-types';
import Swatch from "./Swatch.jsx";

/**
 * SwatchGroup component for selecting product variants like color or size
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the swatch group
 * @param {Array<{value: string, label?: string}>} props.options - Array of options to display
 * @param {'color'|'size'} props.type - Type of swatch (color or size)
 * @param {string} props.selectedValue - Currently selected value
 * @param {Function} props.onChange - Callback when a swatch is selected
 * @returns {JSX.Element}
 */
const SwatchGroup = ({ 
  label, 
  options = [], 
  type, 
  selectedValue, 
  onChange,
  getOptionStatus // New prop to check specific option status
}) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <label className="text-text-primary mb-2 block font-medium">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selectedValue === option.value;
          
          // Check availability/status if callback provided
          const status = getOptionStatus ? getOptionStatus(option.value) : {};
          const isDisabled = status.disabled || false;

          return (
            <Swatch
              key={option.value}
              type={type}
              value={option.value}
              label={option.label || option.value}
              color={option.hex_code} // Pass hex code if available
              isActive={isActive}
              isDisabled={isDisabled}
              onClick={() => !isDisabled && onChange(option.value)}
            />
          );
        })}
      </div>
    </div>
  );
};

SwatchGroup.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string,
      hex_code: PropTypes.string, // Add to prop types
    })
  ).isRequired,
  type: PropTypes.string.isRequired,
  selectedValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  getOptionStatus: PropTypes.func, // Add new prop type
};

export default SwatchGroup;
