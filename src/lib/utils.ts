import { type ClassValue, clsx } from "clsx";
import { addHours, format, parse, parseISO } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const formatDateToString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Format date for backend API with start of day time (00:00:00)
 * Format: YYYY-MM-DD 00:00:00
 */
export const formatDateForApiStart = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 00:00:00`;
};

/**
 * Format date for backend API with end of day time (23:59:59)
 * Format: YYYY-MM-DD 23:59:59
 */
export const formatDateForApiEnd = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 23:59:59`;
};

/**
 * Get default date range for app information queries
 * Returns yesterday as start date and today as end date
 */
export const getDefaultDateRange = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return {
    from: formatDateForApiStart(yesterday),
    to: formatDateForApiEnd(today)
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const formatDateTime = (
  date: string | Date | number | null | undefined
) => {
  if (!date) return null;
  return format(date, "yyyy-MM-dd, h:mm a");
};

// Constants for timezone handling
const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh";
const VIETNAM_LOCALE = "vi-VN";

/**
 * Convert Vietnam time to UTC for API requests
 * Used when sending time data to the API
 */
export const convertVietnamTimeToUtc = (
  timeString: string | Date,
  baseDate?: string | Date
): string => {
  try {
    let vietnamDate: Date;

    if (typeof timeString === "string") {
      // Handle time-only strings (e.g., "07:49", "08:25")
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString.trim())) {
        const today = baseDate ? new Date(baseDate) : new Date();
        const todayStr = format(today, "yyyy-MM-dd");
        vietnamDate = new Date(`${todayStr}T${timeString}:00`);
      } else {
        // Handle full datetime strings
        vietnamDate = new Date(timeString);
      }
    } else {
      vietnamDate = timeString;
    }

    // Convert Vietnam time to UTC
    const utcDate = fromZonedTime(vietnamDate, VIETNAM_TIMEZONE);
    return utcDate.toISOString();
  } catch {
    throw new Error("Invalid time format for UTC conversion");
  }
};

/**
 * Convert Vietnam date and time to UTC for API requests
 * Combines date and time into a full datetime and converts to UTC
 */
export const convertVietnamDateTimeToUtc = (
  date: string | Date,
  time: string
): string => {
  try {
    const dateStr =
      typeof date === "string" ? date : format(date, "yyyy-MM-dd");
    const vietnamDateTime = new Date(`${dateStr}T${time}:00`);

    // Convert Vietnam time to UTC
    const utcDate = fromZonedTime(vietnamDateTime, VIETNAM_TIMEZONE);
    return utcDate.toISOString();
  } catch {
    throw new Error("Invalid date/time format for UTC conversion");
  }
};

/**
 * Get current UTC time as ISO string for API requests
 */
export const getCurrentUtcTime = (): string => {
  return new Date().toISOString();
};

/**
 * Convert a Vietnam timezone Date object to UTC ISO string for API
 */
export const vietnamDateToUtcString = (vietnamDate: Date): string => {
  const utcDate = fromZonedTime(vietnamDate, VIETNAM_TIMEZONE);
  return utcDate.toISOString();
};

// ============================================================================
// API RESPONSE UTILITIES - Convert UTC time to Vietnam time for display
// ============================================================================

/**
 * Convert UTC time from API response to Vietnam time for display
 * This should be used when receiving time data from API responses
 */
export const convertUtcToVietnamTime = (
  utcTimeString: string | null | undefined
): Date | null => {
  if (!utcTimeString) return null;

  try {
    const utcDate = parseISO(utcTimeString);
    if (isNaN(utcDate.getTime())) return null;

    return toZonedTime(utcDate, VIETNAM_TIMEZONE);
  } catch {
    return null;
  }
};

// Comprehensive time formatting utilities for attendance system with client locale
export const formatTimeForDisplay = (
  timeString: string | null | undefined,
  includeSeconds: boolean = false,
  isClient: boolean = false
): string => {
  if (!timeString) return "N/A";

  try {
    let date: Date;

    // Handle time-only strings (e.g., "07:49", "08:25")
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString.trim())) {
      // Parse the time string as UTC time
      date = parse(timeString, "HH:mm", new Date());
      // Convert UTC to Vietnam time (UTC+7)
      date = addHours(date, 7);
    } else {
      // For full datetime strings, parse as UTC and convert to Vietnam time
      date = parseISO(timeString);
      date = toZonedTime(date, VIETNAM_TIMEZONE);
    }

    if (isNaN(date.getTime())) return "Invalid time";

    return format(date, includeSeconds ? "HH:mm:ss" : "HH:mm");
  } catch {
    return "Invalid time";
  }
};

export const formatDateTimeForDisplay = (
  dateTimeString: string | null | undefined,
  isClient: boolean = false
): string => {
  if (!dateTimeString) return "N/A";

  try {
    const date = parseISO(dateTimeString);
    if (isNaN(date.getTime())) return "Invalid date";

    const vietnamDate = toZonedTime(date, VIETNAM_TIMEZONE);
    return format(vietnamDate, "MMM d, yyyy 'at' HH:mm");
  } catch {
    return "Invalid date";
  }
};

export const formatDateForDisplay = (
  dateString: string | null | undefined,
  isClient: boolean = false
): string => {
  if (!dateString) return "N/A";

  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const vietnamDate = toZonedTime(date, VIETNAM_TIMEZONE);
    return format(vietnamDate, "EEEE, MMMM d, yyyy");
  } catch {
    return "Invalid date";
  }
};

export const formatTimeForExport = (
  timeString: string | null | undefined
): string => {
  if (!timeString) return "N/A";

  try {
    let date: Date;

    // Handle time-only strings (e.g., "07:49", "08:25")
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString.trim())) {
      // Parse the time string as UTC time
      date = parse(timeString, "HH:mm", new Date());
      // Convert UTC to Vietnam time (UTC+7)
      date = addHours(date, 7);
    } else {
      // For full datetime strings, parse as UTC and convert to Vietnam time
      date = parseISO(timeString);
      date = toZonedTime(date, VIETNAM_TIMEZONE);
    }

    if (isNaN(date.getTime())) return "Invalid time";

    return format(date, "HH:mm");
  } catch {
    return "Invalid time";
  }
};

export const getCurrentLocaleTime = (): string => {
  const now = new Date();
  const vietnamDate = toZonedTime(now, VIETNAM_TIMEZONE);
  return format(vietnamDate, "HH:mm:ss");
};

// Additional utility to get formatted date/time with full locale support
export const formatFullDateTime = (
  dateTimeString: string | null | undefined,
  isClient: boolean = false
): string => {
  if (!dateTimeString) return "N/A";

  try {
    const date = parseISO(dateTimeString);
    if (isNaN(date.getTime())) return "Invalid date";

    const vietnamDate = toZonedTime(date, VIETNAM_TIMEZONE);
    return format(vietnamDate, "MMM d, yyyy HH:mm");
  } catch {
    return "Invalid date";
  }
};

// Hydration-safe utility to get client timezone info
export const getTimezoneInfo = (isClient: boolean = false) => {
  return {
    locale: VIETNAM_LOCALE,
    timezone: VIETNAM_TIMEZONE,
  };
};

// ============================================================================
// UTILITY FUNCTIONS FOR FORM HANDLING
// ============================================================================

/**
 * Prepare time data for API submission (converts Vietnam time to UTC)
 * Use this in forms before sending data to API
 */
export const prepareTimeForApi = (
  data: Record<string, any>
): Record<string, any> => {
  const prepared = { ...data };

  // Common time field names that need conversion
  const timeFields = [
    "checkin_time",
    "checkout_time",
    "start_time",
    "end_time",
    "created_at",
    "updated_at",
    "time",
    "datetime",
  ];

  timeFields.forEach((field) => {
    if (prepared[field] && typeof prepared[field] === "string") {
      try {
        prepared[field] = convertVietnamTimeToUtc(prepared[field]);
      } catch (error) {
        console.warn(`Failed to convert ${field} to UTC:`, error);
      }
    }
  });

  return prepared;
};

/**
 * Process API response data (converts UTC time to Vietnam time for display)
 * Use this after receiving data from API
 */
export const processTimeFromApi = (
  data: Record<string, any>
): Record<string, any> => {
  const processed = { ...data };

  // Common time field names that need conversion
  const timeFields = [
    "checkin_time",
    "checkout_time",
    "start_time",
    "end_time",
    "created_at",
    "updated_at",
    "time",
    "datetime",
  ];

  timeFields.forEach((field) => {
    if (processed[field] && typeof processed[field] === "string") {
      const vietnamTime = convertUtcToVietnamTime(processed[field]);
      if (vietnamTime) {
        processed[field] = vietnamTime.toISOString();
      }
    }
  });

  return processed;
};

/**
 * Get current timezone info and convert UTC time to Vietnam timezone
 * Returns timezone format (e.g., "UTC +7") and converted time
 */
export const getCurrentTimezoneInfo = (utcTime?: string | Date) => {
  // Vietnam is always UTC+7
  const timezoneFormat = "UTC +7";

  // Convert UTC time to Vietnam timezone if provided
  let convertedTime: string | null = null;
  if (utcTime) {
    try {
      let utcDate: Date;

      if (typeof utcTime === 'string') {
        // Handle different date formats
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(utcTime)) {
          // Format: "2025-06-27 04:43:57" - treat as UTC
          utcDate = new Date(utcTime + 'Z'); // Add 'Z' to indicate UTC
        } else {
          utcDate = parseISO(utcTime);
        }
      } else {
        utcDate = utcTime;
      }

      if (!isNaN(utcDate.getTime())) {
        const vietnamTime = toZonedTime(utcDate, VIETNAM_TIMEZONE);
        convertedTime = format(vietnamTime, "yyyy-MM-dd HH:mm:ss");
      }
    } catch (error) {
      console.warn('Failed to convert UTC time to Vietnam time:', error);
    }
  }

  return {
    timezoneFormat,
    convertedTime
  };
};
