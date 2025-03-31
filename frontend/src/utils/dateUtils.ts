import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

/**
 * Gets the local timezone string
 * @returns Local timezone string (e.g., 'America/New_York')
 */
const getLocalTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Formats a date to local timezone with consistent formatting
 * @param date - Date object or string
 * @returns Formatted date string in local timezone
 */
export const formatDateToEST = (date: Date | string): string => {
  try {
    // First ensure we have a Date object
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Convert the UTC date to local timezone

    const localDate = new Date(
      dateObj.getTime() - dateObj.getTimezoneOffset() * 60000,
    );

    // Format the date in local timezone
    return format(localDate, "MMM d, yyyy h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

/**
 * Formats a date to local timezone with date only (no time)
 * @param date - Date object or string
 * @returns Formatted date string in local timezone
 */
export const formatDateOnlyToEST = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const localDate = utcToZonedTime(dateObj, getLocalTimezone());
  return format(localDate, "yyyy-MM-dd");
};

/**
 * Formats a date to local timezone with time only (no date)
 * @param dateString - Date string
 * @returns Formatted time string in local timezone
 */
export const formatTimeOnlyToEST = (
  dateString: string | null | undefined,
): string => {
  try {
    if (!dateString) {
      return "N/A";
    }
    const dateObj = new Date(dateString);
    const localDate = utcToZonedTime(dateObj, getLocalTimezone());
    return format(localDate, "h:mm a");
  } catch (error) {
    console.error("Error parsing date:", error);
    return "N/A";
  }
};
