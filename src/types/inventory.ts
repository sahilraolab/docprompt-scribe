/**
 * Inventory Module Types
 * Aligned 1:1 with backend models
 */

import { ID, AuditMeta } from './common';

// =============== GRN (Goods Receipt Note) ===============

export type GRNStatus = 'DRAFT' | 'QC_PENDING' | 'APPROVED' | 'PARTIAL_APPROVED' | 'REJECTED';

export interface GRNLine {
  id?: ID;
  grnId?: ID;
  poLineId: ID;
  materialId: ID;
  materialName?: string;
  materialCode?: string;
  uom?: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  remarks?: string;
}

export interface GRN extends AuditMeta {
  id: ID;
  grnNo: string;
  projectId: ID;
  projectName?: string;
  locationId: ID;
  locationName?: string;
  poId: ID;
  poNo?: string;
  receivedBy?: ID;
  receivedByName?: string;
  grnDate?: string;
  status: GRNStatus;
  billed: boolean;
  lines: GRNLine[];
}

export interface CreateGRNRequest {
  projectId: number;
  locationId: number;
  poId: number;
  lines: {
    poLineId: number;
    materialId: number;
    orderedQty: number;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    remarks?: string;
  }[];
}

// =============== Stock ===============

export interface Stock {
  id: ID;
  projectId: ID;
  projectName?: string;
  locationId: ID;
  locationName?: string;
  materialId: ID;
  materialName?: string;
  materialCode?: string;
  uom?: string;
  quantity: number;
  rate?: number;
  value?: number;
  lastUpdated?: string;
}

// =============== Stock Ledger ===============

export type StockLedgerRefType = 'GRN' | 'ISSUE' | 'ISSUE_CANCEL' | 'TRANSFER';

export interface StockLedger {
  id: ID;
  projectId: ID;
  locationId: ID;
  materialId: ID;
  materialName?: string;
  refType: StockLedgerRefType;
  refId: ID;
  qtyIn: number;
  qtyOut: number;
  balance: number;
  remarks?: string;
  createdAt: string;
}

// =============== Material Issue ===============

export type MaterialIssueStatus = 'DRAFT' | 'APPROVED' | 'CANCELLED';

export interface MaterialIssueLine {
  id?: ID;
  issueId?: ID;
  materialId: ID;
  materialName?: string;
  materialCode?: string;
  uom?: string;
  issuedQty: number;
  remarks?: string;
}

export interface MaterialIssue extends AuditMeta {
  id: ID;
  issueNo: string;
  projectId: ID;
  projectName?: string;
  fromLocationId: ID;
  fromLocationName?: string;
  issuedTo?: string;
  purpose: string;
  issueDate?: string;
  status: MaterialIssueStatus;
  lines: MaterialIssueLine[];
}

export interface CreateMaterialIssueRequest {
  projectId: number;
  fromLocationId: number;
  purpose: string;
  issuedTo?: string;
  lines: {
    materialId: number;
    issuedQty: number;
    remarks?: string;
  }[];
}

// =============== Stock Transfer ===============

export type StockTransferStatus = 'DRAFT' | 'APPROVED' | 'COMPLETED';

export interface StockTransferLine {
  id?: ID;
  transferId?: ID;
  materialId: ID;
  materialName?: string;
  materialCode?: string;
  uom?: string;
  transferQty: number;
  remarks?: string;
}

export interface StockTransfer extends AuditMeta {
  id: ID;
  transferNo: string;
  projectId: ID;
  projectName?: string;
  fromLocationId: ID;
  fromLocationName?: string;
  toLocationId: ID;
  toLocationName?: string;
  transferDate?: string;
  vehicleNo?: string;
  driverName?: string;
  status: StockTransferStatus;
  remarks?: string;
  lines: StockTransferLine[];
}

export interface CreateStockTransferRequest {
  projectId: number;
  fromLocationId: number;
  toLocationId: number;
  vehicleNo?: string;
  driverName?: string;
  remarks?: string;
  lines: {
    materialId: number;
    transferQty: number;
    remarks?: string;
  }[];
}
