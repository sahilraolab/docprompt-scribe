/**
 * Date utility functions
 */

/**
 * Get start of day
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Add months to date
 */
export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

/**
 * Get difference in days
 */
export const diffInDays = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is in range
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return date >= startDate && date <= endDate;
};

/**
 * Get financial year from date
 */
export const getFinancialYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Financial year starts from April (month 3)
  if (month < 3) {
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
};

/**
 * Get financial year start date
 */
export const getFinancialYearStart = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month < 3) {
    return new Date(year - 1, 3, 1);
  } else {
    return new Date(year, 3, 1);
  }
};

/**
 * Get financial year end date
 */
export const getFinancialYearEnd = (date: Date): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month < 3) {
    return new Date(year, 2, 31);
  } else {
    return new Date(year + 1, 2, 31);
  }
};

/**
 * Parse date string (DD/MM/YYYY)
 */
export const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
};

/**
 * Format date to DD/MM/YYYY
 */
export const formatDateStr = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is overdue
 */
export const isOverdue = (date: Date): boolean => {
  return date < new Date() && !isToday(date);
};

/**
 * Get weekday name
 */
export const getWeekdayName = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long' }).format(date);
};

/**
 * Get month name
 */
export const getMonthName = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date);
};
