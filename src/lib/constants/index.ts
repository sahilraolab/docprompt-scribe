/**
 * Application-wide constants
 */

// Application Info
export const APP_NAME = 'Construction ERP';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Comprehensive ERP solution for construction management';

// Date Formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Currency
export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

// Indian States
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli',
  'Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

// Unit of Measurements
export const UOMS = [
  'Bag',
  'Box',
  'Bag',
  'Cum',
  'Kg',
  'Ltr',
  'Mtr',
  'No',
  'Pcs',
  'Quintal',
  'Set',
  'Sqft',
  'Sqm',
  'Ton',
  'Unit',
] as const;

// Status Types
export const STATUSES = {
  DRAFT: 'Draft',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SENT: 'Sent',
  RECEIVED: 'Received',
  CLOSED: 'Closed',
  ACTIVE: 'Active',
  PLANNING: 'Planning',
  ON_HOLD: 'OnHold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

// Account Types
export const ACCOUNT_TYPES = [
  'Asset',
  'Liability',
  'Equity',
  'Income',
  'Expense',
] as const;

// Roles
export const ROLES = [
  'Admin',
  'ProjectManager',
  'PurchaseOfficer',
  'SiteEngineer',
  'Accountant',
  'Approver',
  'Viewer',
] as const;

// Role Descriptions
export const ROLE_DESCRIPTIONS = {
  Admin: 'Full system access and user management',
  ProjectManager: 'Manage projects, approve purchases and contracts',
  PurchaseOfficer: 'Handle procurement and supplier management',
  SiteEngineer: 'Manage site operations and material tracking',
  Accountant: 'Handle financial transactions and reporting',
  Approver: 'Review and approve workflow items',
  Viewer: 'Read-only access to view reports and data',
} as const;

// Tax Rates (GST)
export const GST_RATES = [0, 5, 12, 18, 28] as const;
export const DEFAULT_GST_RATE = 18;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// Module Names
export const MODULES = {
  ENGINEERING: 'Engineering',
  PURCHASE: 'Purchase',
  CONTRACTS: 'Contracts',
  SITE: 'Site',
  ACCOUNTS: 'Accounts',
  WORKFLOW: 'Workflow',
  ADMIN: 'Admin',
} as const;

// Document Types by Module
export const DOCUMENT_TYPES = {
  ENGINEERING: ['Project', 'Estimate', 'Drawing', 'Report'],
  PURCHASE: ['MR', 'Quotation', 'PO', 'Bill', 'Comparative Statement'],
  CONTRACTS: ['Work Order', 'RA Bill', 'Advance', 'Note'],
  SITE: ['GRN', 'Issue', 'Transfer', 'QC'],
  ACCOUNTS: ['Journal', 'Payment', 'Receipt', 'Ledger'],
} as const;

// Approval Limits (in INR)
export const APPROVAL_LIMITS = {
  PURCHASE_OFFICER: 100000,
  PROJECT_MANAGER: 500000,
  DIRECTOR: 2000000,
  BOARD: Infinity,
} as const;

// Work Order Progress Statuses
export const WO_PROGRESS_STATUS = {
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  NEAR_COMPLETION: 75,
  COMPLETED: 100,
} as const;

// Quality Ratings
export const QUALITY_RATINGS = {
  EXCELLENT: 5,
  GOOD: 4,
  AVERAGE: 3,
  BELOW_AVERAGE: 2,
  POOR: 1,
} as const;

// Retention Percentages
export const DEFAULT_RETENTION_PCT = 5;
export const MAX_RETENTION_PCT = 10;

// Payment Terms
export const PAYMENT_TERMS = [
  'Immediate',
  '15 days',
  '30 days',
  '45 days',
  '60 days',
  '90 days',
  'Against Delivery',
  'Advance',
  'COD',
] as const;

// Delivery Terms
export const DELIVERY_TERMS = [
  'FOB',
  'CIF',
  'Ex-Works',
  'Door Delivery',
] as const;

// SLA Duration (in hours)
export const SLA_DURATIONS = {
  URGENT: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 168, // 1 week
} as const;
