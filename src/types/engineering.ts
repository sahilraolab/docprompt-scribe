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

// Estimate (matches backend estimate.model.js)
export interface Estimate extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  name: string;
  baseAmount: number;
  status: 'DRAFT' | 'FINAL';
}

// Estimate Version (matches backend estimateVersion.model.js)
export interface EstimateVersion extends AuditMeta {
  id: ID;
  estimateId: ID;
  versionNo: number;
  amount: number;
}

// Budget (matches backend budget.model.js)
export interface Budget extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  totalBudget: number;
  status: 'DRAFT' | 'APPROVED';
}

// BBS - Bar Bending Schedule (matches backend bbs.model.js)
export interface BBS extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  code: string;
  description?: string;
  quantity: number;
  uomId: ID;
  uomName?: string;
  rate: number;
  amount: number;
  status: 'DRAFT' | 'APPROVED';
}

// Drawing (matches backend drawing.model.js)
export interface Drawing extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  title: string;
  drawingNo: string;
  discipline?: string;
  status: 'DRAFT' | 'APPROVED';
}

// Drawing Revision (matches backend drawingRevision.model.js)
export interface DrawingRevision extends AuditMeta {
  id: ID;
  drawingId: ID;
  revisionNo: string;
  changeNote?: string;
  status: 'SUBMITTED' | 'APPROVED';
}

// Compliance (matches backend compliance.model.js)
export interface Compliance extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  type: string;
  documentRef?: string;
  validTill?: string;
}

// BOQ - Bill of Quantities (existing)
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
