import { format, addMinutes } from 'date-fns';

/**
 * Returns a date object shifted to Pakistan Time (UTC+5).
 * Note: This shifts the date values so that they match PKT when viewed in local time.
 * @param {Date|string} date
 */
export const getPKTDate = (date = new Date()) => {
    const d = new Date(date);
    // PKT is UTC+5. To force PKT display regardless of device timezone:
    // 1. Get UTC time
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 2. Add 5 hours (300 mins) to UTC
    return new Date(utc + (300 * 60000));
};

/**
 * Formats a date string/object to show Pakistan Time.
 */
export const formatPKT = (date, formatStr = 'EEE, MMM dd • h:mm a') => {
    return format(getPKTDate(date), formatStr);
};
