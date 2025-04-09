/**
 * Formats a date into "Joined Month Year" format.
 * Example: "Joined January 2025"
 * @param date - The date object, date string, or timestamp to format.
 * @returns The formatted date string or an empty string if the date is invalid.
 */
export function formatJoinedDate(date: Date | string | number): string {
  try {
    const dateObj = new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date provided to formatJoinedDate:", date);
      return ""; // Or return a default string like "Joined Unknown"
    }

    const month = dateObj.toLocaleString('en-US', { month: 'long' }); // Get full month name (e.g., "January")
    const year = dateObj.getFullYear(); // Get the full year (e.g., 2025)

    return `Joined ${month} ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return ""; // Return empty string on error
  }
}