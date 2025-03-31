/**
 * Formats a UTC date string to EST/EDT with consistent formatting
 * @param dateString - UTC date string from the backend
 * @returns Formatted date string in EST/EDT
 */
export const formatDateToEST = (
  dateString: string | null | undefined,
): string => {
  try {
    if (!dateString) {
      return "N/A";
    }
    // Parse the UTC date string
    const utcDate = new Date(dateString + "Z"); // Append Z to ensure UTC interpretation
    // Convert to EST
    const estDate = new Date(
      utcDate.toLocaleString("en-US", { timeZone: "America/New_York" }),
    );
    return estDate.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

/**
 * Formats a UTC date string to EST/EDT with date only (no time)
 * @param dateString - UTC date string from the backend
 * @returns Formatted date string in EST/EDT
 */
export const formatDateOnlyToEST = (
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
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "America/New_York",
    });
  } catch (error) {
    console.error("Error parsing date:", error);
    return "N/A";
  }
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
