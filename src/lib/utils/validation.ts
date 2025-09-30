import { z } from 'zod';

/**
 * Common validation schemas for reuse across the application
 */

// Indian phone number validation (10 digits)
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
  .optional()
  .or(z.literal(''));

// GST number validation (Indian format)
export const gstSchema = z
  .string()
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GST number format'
  )
  .optional()
  .or(z.literal(''));

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

// PAN number validation (Indian format)
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format')
  .optional()
  .or(z.literal(''));

// Amount validation (positive number)
export const amountSchema = z
  .number()
  .min(0, 'Amount must be positive')
  .or(z.string().transform((val) => parseFloat(val)));

// Percentage validation (0-100)
export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be between 0 and 100')
  .max(100, 'Percentage must be between 0 and 100');

// Date validation (ISO format)
export const dateSchema = z.string().min(1, 'Date is required');

// Code validation (alphanumeric with hyphens)
export const codeSchema = z
  .string()
  .regex(/^[A-Z0-9-]+$/, 'Code must be alphanumeric with hyphens only')
  .min(1, 'Code is required');

/**
 * Validation helper functions
 */

// Validate if date1 is before date2
export const isDateBefore = (date1: string, date2: string): boolean => {
  return new Date(date1) < new Date(date2);
};

// Validate if date is in the future
export const isFutureDate = (date: string): boolean => {
  return new Date(date) > new Date();
};

// Validate if date is in the past
export const isPastDate = (date: string): boolean => {
  return new Date(date) < new Date();
};

// Validate Indian Aadhaar number
export const validateAadhaar = (aadhaar: string): boolean => {
  return /^\d{12}$/.test(aadhaar);
};

// Validate IFSC code
export const validateIFSC = (ifsc: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
};

// Validate positive number
export const isPositive = (num: number): boolean => {
  return num > 0;
};

// Validate non-negative number
export const isNonNegative = (num: number): boolean => {
  return num >= 0;
};
