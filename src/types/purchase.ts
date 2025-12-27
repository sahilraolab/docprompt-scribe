import { ID, AuditMeta } from './common';

/**
 * Purchase Module Types
 * Matches backend API Contract v1
 */

// ============= SUPPLIER =============
export interface Supplier extends AuditMeta {
  id: ID;
  name: string;
  code: string;
  contact: string;
  phone?: string;
  email?: string;
  gst?: string;
  city?: string;
  state?: string;
  rating?: number;
  active: boolean;
}

// ============= REQUISITION (MR) =============
export type RequisitionStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Requisition extends AuditMeta {
  id: ID;
  reqNo: string;
  projectId: ID;
  projectName?: string;
  
  // 🔒 Engineering lock references
  budgetId: ID;
  estimateId: ID;
  
  requestedBy: ID;
  requestedByName?: string;
  submittedAt?: string;
  status: RequisitionStatus;
  items?: RequisitionItem[];
}

export interface RequisitionItem {
  id: ID;
  materialId: ID;
  materialName?: string;
  description: string;
  qty: number;
  uom: string;
  requiredBy?: string;
}

// ============= RFQ =============
export type RFQStatus = 'OPEN' | 'CLOSED';

export interface RFQ extends AuditMeta {
  id: ID;
  rfqNo: string;
  requisitionId: ID;
  supplierId: ID;
  supplierName?: string;
  rfqDate: string;
  closingDate?: string;
  status: RFQStatus;
}

// ============= QUOTATION =============
export type QuotationStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Quotation extends AuditMeta {
  id: ID;
  rfqId: ID;
  projectId: ID;
  projectName?: string;
  
  // 🔒 Engineering lock references
  budgetId: ID;
  estimateId: ID;
  
  supplierId: ID;
  supplierName?: string;
  validTill?: string;
  currency?: string;
  totalAmount: number;
  status: QuotationStatus;
  
  approvedAt?: string;
  approvedBy?: ID;
  rejectionReason?: string;
  
  items?: QuotationItem[];
}

export interface QuotationItem extends AuditMeta {
  id: ID;
  quotationId: ID;
  projectId: ID;
  bbsId?: ID; // 🔒 Engineering traceability
  materialId: ID;
  materialName?: string;
  qty: number;
  rate: number;
  amount: number; // Auto-calculated: qty * rate
  taxPercent?: number;
  taxAmount?: number; // Auto-calculated
  totalAmount?: number; // Auto-calculated: amount + taxAmount
}

// ============= PURCHASE ORDER (PO) =============
export type POStatus = 'CREATED' | 'APPROVED' | 'CANCELLED';

export interface PurchaseOrder extends AuditMeta {
  id: ID;
  poNo: string;
  projectId: ID;
  projectName?: string;
  
  // 🔒 Engineering lock references
  budgetId: ID;
  estimateId: ID;
  
  quotationId: ID;
  supplierId: ID;
  supplierName?: string;
  poDate: string;
  totalAmount: number;
  status: POStatus;
  
  // Cancellation audit
  cancelledAt?: string;
  cancelledBy?: ID;
  cancellationReason?: string;
  
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem extends AuditMeta {
  id: ID;
  purchaseOrderId: ID;
  materialId: ID;
  materialName?: string;
  qty: number;
  rate: number;
  amount: number; // Auto-calculated: qty * rate
}

// ============= PURCHASE BILL =============
export type PurchaseBillStatus = 'DRAFT' | 'APPROVED' | 'POSTED';

export interface PurchaseBill extends AuditMeta {
  id: ID;
  billNo: string;
  projectId: ID;
  projectName?: string;
  
  // 🔒 Engineering lock references
  budgetId: ID;
  estimateId: ID;
  
  poId: ID;
  poNo?: string;
  grnId: ID; // One bill per GRN
  supplierId: ID;
  supplierName?: string;
  billDate: string;
  basicAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: PurchaseBillStatus;
  postedToAccounts: boolean;
}

// ============= LOCKING RULES =============
// Requisition: SUBMITTED → locked
// RFQ: CLOSED → locked
// Quotation: APPROVED/REJECTED → locked
// PO: APPROVED/CANCELLED → locked
// PurchaseBill: POSTED → locked

export const isLocked = {
  requisition: (status: RequisitionStatus) => status !== 'DRAFT',
  rfq: (status: RFQStatus) => status === 'CLOSED',
  quotation: (status: QuotationStatus) => status !== 'SUBMITTED',
  po: (status: POStatus) => status !== 'CREATED',
  purchaseBill: (status: PurchaseBillStatus) => status === 'POSTED',
};

// Legacy types for backward compatibility
export type MR = Requisition;
export type MRItem = RequisitionItem;
export type PO = PurchaseOrder;
export type POItem = PurchaseOrderItem;
