import { format } from "date-fns";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

/**
 * Formats a UTC date string to EST/EDT with consistent formatting
 * @param dateString - UTC date string from the backend
 * @returns Formatted date string in EST/EDT
 */
export const formatDateToEST = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const estDate = utcToZonedTime(dateObj, "America/New_York");
  return format(estDate, "MMM d, yyyy h:mm a");
};

/**
 * Formats a UTC date string to EST/EDT with date only (no time)
 * @param dateString - UTC date string from the backend
 * @returns Formatted date string in EST/EDT
 */
export const formatDateOnlyToEST = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const estDate = utcToZonedTime(dateObj, "America/New_York");
  return format(estDate, "yyyy-MM-dd");
};

/**
 * Formats a UTC date string to EST/EDT with time only (no date)
 * @param dateString - UTC date string from the backend
 * @returns Formatted time string in EST/EDT
 */
export const formatTimeOnlyToEST = (
  dateString: string | null | undefined,
): string => {
  try {
    if (!dateString) {
      return "N/A";
    }
    const utcDate = new Date(dateString + "Z");
    const estDate = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );
    return estDate.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/New_York",
      timeZoneName: "short",
    });
  } catch (error) {
    console.error("Error parsing date:", error);
    return "N/A";
  }
};
