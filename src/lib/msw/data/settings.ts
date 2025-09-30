import { CompanyProfile, FinancialYear, SystemSettings } from '@/types';

export const companyProfile: CompanyProfile = {
  id: 'company-1',
  name: 'BuildTech Constructions Pvt Ltd',
  address: '123 Construction Plaza, Bandra Kurla Complex',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400051',
  phone: '+91 22 6789 0000',
  email: 'info@buildtech.com',
  gst: '27AAAAA1234A1Z5',
  pan: 'AAAAA1234A',
  website: 'www.buildtech.com',
  createdBy: 'user-1',
  createdAt: '2023-01-01T10:00:00Z',
};

export const financialYears: FinancialYear[] = [
  {
    id: 'fy-1',
    name: 'FY 2023-24',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    active: false,
    locked: true,
    createdBy: 'user-1',
    createdAt: '2023-03-15T10:00:00Z',
  },
  {
    id: 'fy-2',
    name: 'FY 2024-25',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    active: true,
    locked: false,
    createdBy: 'user-1',
    createdAt: '2024-03-15T10:00:00Z',
  },
];

export const systemSettings: SystemSettings = {
  id: 'sys-1',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'short',
  taxDefaults: {
    gst: 18,
    wct: 2,
    tds: 2,
  },
  approvalThresholds: {
    po: 500000,
    wo: 1000000,
    payment: 100000,
  },
  slaDefaults: {
    poApproval: 24,
    grnQc: 48,
    billPayment: 72,
  },
  createdBy: 'user-1',
  createdAt: '2024-01-01T10:00:00Z',
};
