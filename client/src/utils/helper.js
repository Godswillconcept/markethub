// utils/helper.js

export function getPlaceholder(firstName = "", lastName = "") {
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  return `https://placehold.co/600x400/EEE/31343C?text=${initials || "?"}`;
}

/**
 * Gets a consistent random item from an array based on the current date
 * @param {Array} items - Array of items to select from
 * @returns {*} A random item from the array
 */
export function getRandomVendor(items) {
  if (!items || items.length === 0) return null;

  // Get today's date as a seed (YYYYMMDD format)
  const today = new Date();
  const seed = parseInt(
    `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
    10,
  );

  // Simple deterministic random based on the date
  const randomIndex = seed % items.length;
  return items[randomIndex];
}

/**
 * Formats a date string to a human-readable format
 * @param {string|Date} dateInput - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @param {string} locale - Locale to use for formatting (default: "en-NG")
 * @returns {string} Formatted date string
 */

/**
 * Formats a date string to a human-readable format
 * @param {string|Date} dateInput - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, options = {}) {
  if (!dateInput) return "—";

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput; // Return original if invalid

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat("en-NG", defaultOptions).format(date);
  } catch {
    return dateInput; // Return original on error
  }
}


/**
 * Formats a date string to a human-readable format (GB locale)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export function formatDateGB(dateInput) {
  if (!dateInput) return "—";

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput; // Return original if invalid

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Intl.DateTimeFormat("en-GB", options).format(date);
  } catch {
    return dateInput; // Return original on error
  }
}

/**
 * Formats a date string to a human-readable format (US locale)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
export function formatDateUS(dateInput) {
  if (!dateInput) return "—";

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput; // Return original if invalid

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch {
    return dateInput; // Return original on error
  }
}

/**
 * Safely renders a value, handling potential object children that would crash React
 * @param {any} value - The value to render
 * @param {string} fallback - Fallback if value is null/undefined
 * @returns {string|any} Safe rendering value
 */
export function safeRender(value, fallback = "") {
  if (value === null || value === undefined) return fallback;

  // If it's a primitive (string, number, boolean), it's safe
  if (typeof value !== "object") return value;

  // If it's an array, React can handle it if its elements are safe
  if (Array.isArray(value)) return value;

  // It's a non-null object, which will crash React if rendered directly
  // Try to find a meaningful string property
  if (value.business_name) return value.business_name;
  if (value.name) return value.name;
  if (value.filename) return value.filename;
  if (value.originalname) return value.originalname;
  if (value.url) return value.url;
  if (value.title) return value.title;

  // Fallback to JSON stringification for debugging/visibility
  try {
    return JSON.stringify(value);
  } catch {
    return "[Object]";
  }
}
