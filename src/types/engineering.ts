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
  itemId?: ID; // Link to Master Item
  itemName?: string;
  description: string;
  qty: number;
  uom: string;
  rate: number;
  amount: number;
}

// BOQ - Bill of Quantities
export interface BOQ extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  estimateId?: ID;
  version: number;
  items: BOQItem[];
  status: 'Draft' | 'Approved' | 'Active' | 'Completed';
  totalCost: number;
}

export interface BOQItem {
  id: ID;
  itemId: ID; // Master Item reference
  itemName?: string;
  itemCode?: string;
  category: string;
  description: string;
  qty: number;
  uom: string;
  estimatedRate: number;
  actualRate?: number;
  estimatedAmount: number;
  actualAmount?: number;
  consumedQty?: number;
  balanceQty?: number;
  activityCode?: string;
  activityName?: string;
}

// Material Master - Shared across modules
export interface MaterialMaster extends AuditMeta {
  id: ID;
  code: string;
  name: string;
  description?: string;
  category: string;
  subCategory?: string;
  uom: string;
  specification?: string;
  make?: string;
  brand?: string;
  hsnCode?: string;
  taxRate?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderLevel?: number;
  standardRate?: number;
  lastPurchaseRate?: number;
  active: boolean;
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
