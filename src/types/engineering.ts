import { ID, Status, AuditMeta, ApprovalMeta } from './common';

export interface Project extends AuditMeta {
  id: ID;
  name: string;
  code: string;
  city: string;
  state: string;
  startDate: string;
  endDate?: string;
  managerId: ID;
  managerName?: string;
  budget: number;
  spent: number;
  progress: number;
  status: 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled';
  reraId?: string;
  description?: string;
}

export interface Estimate extends AuditMeta, ApprovalMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  version: number;
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  description?: string;
}

export interface EstimateItem {
  id: ID;
  type: 'Material' | 'Labour' | 'Equipment' | 'Overhead';
  description: string;
  qty: number;
  uom: string;
  rate: number;
  amount: number;
}

export interface Document extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  name: string;
  type: 'Plan' | 'Permit' | 'Report' | 'Drawing' | 'Other';
  version: number;
  url: string;
  size?: number;
}

export interface Plan extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: Status;
  assignedTo: ID;
  assignedToName?: string;
}
