/**
 * A utility function for conditionally joining classNames together
 * @param {...any} inputs - Class names or objects with class names as keys and boolean values
 * @returns {string} - A single string of class names
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}
