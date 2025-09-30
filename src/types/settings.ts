import { ID, Currency, AuditMeta } from './common';

export interface CompanyProfile extends AuditMeta {
  id: ID;
  name: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  gst?: string;
  pan?: string;
  website?: string;
}

export interface FinancialYear extends AuditMeta {
  id: ID;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  locked: boolean;
}

export interface SystemSettings extends AuditMeta {
  id: ID;
  currency: Currency;
  timezone: string;
  dateFormat: string;
  numberFormat: 'short' | 'full';
  taxDefaults: {
    gst: number;
    wct: number;
    tds: number;
  };
  approvalThresholds: {
    po: number;
    wo: number;
    payment: number;
  };
  slaDefaults: {
    poApproval: number;
    grnQc: number;
    billPayment: number;
  };
}
