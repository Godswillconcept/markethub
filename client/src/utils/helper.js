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
export function formatDate(dateInput, options = {}, locale = "en-NG") {
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

    return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
  } catch {
    return dateInput; // Return original on error
  }
}

/**
 * Formats a date string to US English format (Jan 1, 2023)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string in US English format
 */
export function formatDateUS(dateInput) {
  return formatDate(dateInput, {}, "en-US");
}

/**
 * Formats a date string to British English format (1 Jan 2023)
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string in British English format
 */
export function formatDateGB(dateInput) {
  return formatDate(dateInput, { day: "2-digit", month: "short", year: "numeric" }, "en-GB");
}
