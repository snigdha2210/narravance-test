export const formatDate = (
  dateString: string | undefined,
  includeTime: boolean = false,
): string => {
  if (!dateString) return "Present";
  try {
    // Handle different date string formats
    let date: Date;
    if (dateString.includes("T")) {
      // ISO format
      date = new Date(dateString);
    } else if (dateString.includes("-")) {
      // YYYY-MM-DD format
      date = new Date(dateString + "T00:00:00");
    } else {
      // Try parsing as is
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }

    if (includeTime) {
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    }

    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid Date";
  }
};
