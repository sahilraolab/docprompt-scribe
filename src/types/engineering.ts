import { ID, AuditMeta } from './common';

/**
 * Engineering Module Types
 * Matches backend models exactly
 */

// ============= BUDGET =============
export type BudgetStatus = 'DRAFT' | 'APPROVED';

export interface Budget extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  totalBudget: number;
  status: BudgetStatus;
}

// ============= ESTIMATE =============
export type EstimateStatus = 'DRAFT' | 'FINAL';

export interface Estimate extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  name: string;
  baseAmount: number;
  status: EstimateStatus;
  versions?: EstimateVersion[];
}

export interface EstimateVersion extends AuditMeta {
  id: ID;
  estimateId: ID;
  versionNo: number;
  amount: number;
}

// ============= BBS (Bar Bending Schedule) =============
export type BBSStatus = 'DRAFT' | 'APPROVED';

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
  amount: number; // Auto-calculated: quantity * rate
  status: BBSStatus;
}

// ============= DRAWING =============
export type DrawingStatus = 'DRAFT' | 'APPROVED';
export type DrawingRevisionStatus = 'SUBMITTED' | 'APPROVED';

export interface Drawing extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  title: string;
  drawingNo: string;
  discipline?: string;
  status: DrawingStatus;
  revisions?: DrawingRevision[];
}

export interface DrawingRevision extends AuditMeta {
  id: ID;
  drawingId: ID;
  revisionNo: string;
  changeNote?: string;
  status: DrawingRevisionStatus;
}

// ============= COMPLIANCE =============
export interface Compliance extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  type: string;
  documentRef?: string;
  validTill?: string;
}

// ============= LOCKING RULES =============
// Budget: APPROVED → locked
// Estimate: FINAL → locked
// BBS: APPROVED → locked

export const isLocked = {
  budget: (status: BudgetStatus) => status === 'APPROVED',
  estimate: (status: EstimateStatus) => status === 'FINAL',
  bbs: (status: BBSStatus) => status === 'APPROVED',
  drawing: (status: DrawingStatus) => status === 'APPROVED',
};

// ============= PROJECT (from Masters) =============
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
