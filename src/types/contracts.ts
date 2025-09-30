import { ID, Status, AuditMeta, ApprovalMeta } from './common';

export interface Contractor extends AuditMeta {
  id: ID;
  name: string;
  contact: string;
  phone?: string;
  email?: string;
  gst?: string;
  city?: string;
  state?: string;
  rating?: number;
  active: boolean;
}

export interface LabourRate extends AuditMeta {
  id: ID;
  skill: string;
  category: string;
  rate: number;
  uom: string;
  effectiveFrom: string;
}

export interface WO extends AuditMeta, ApprovalMeta {
  id: ID;
  code: string;
  contractorId: ID;
  contractorName?: string;
  projectId: ID;
  projectName?: string;
  scope: string;
  startDate: string;
  endDate: string;
  amount: number;
  spent: number;
  status: Status;
  revision?: number;
  progress: number;
}

export interface RABill extends AuditMeta, ApprovalMeta {
  id: ID;
  code: string;
  woId: ID;
  woCode?: string;
  billNo: number;
  periodFrom: string;
  periodTo: string;
  measuredAmount: number;
  tax: number;
  advanceRecovery: number;
  total: number;
  status: Status;
}

export interface Advance extends AuditMeta {
  id: ID;
  contractorId: ID;
  contractorName?: string;
  woId?: ID;
  woCode?: string;
  amount: number;
  paidAt: string;
  balance?: number;
  status: Status;
}

export interface NoteDC extends AuditMeta {
  id: ID;
  code: string;
  contractorId: ID;
  contractorName?: string;
  type: 'Debit' | 'Credit';
  amount: number;
  reason: string;
  date: string;
  status: Status;
}
