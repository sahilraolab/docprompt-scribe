import { GRN, Issue, Transfer } from '@/types/site';

export const grns: GRN[] = [
  {
    id: 'grn-1',
    code: 'GRN/2024/001',
    poId: 'po-1',
    poCode: 'PO-2024-001',
    receivedAt: '2024-01-26',
    items: [
      { id: 'grni-1', itemId: 'item-1', itemName: 'ACC Cement 53 Grade', qty: 200, receivedQty: 200, uom: 'Bags' },
      { id: 'grni-2', itemId: 'item-2', itemName: 'TMT Bars 12mm', qty: 15, receivedQty: 15, uom: 'MT' },
    ],
    qcStatus: 'Pass',
    status: 'Received',
    createdBy: 'user-4',
    createdAt: '2024-01-26T10:00:00Z',
  },
];

export const issues: Issue[] = [
  {
    id: 'iss-1',
    code: 'ISS/2024/001',
    projectId: 'proj-1',
    projectName: 'Skyline Towers',
    itemId: 'item-1',
    itemName: 'ACC Cement 53 Grade',
    qty: 50,
    uom: 'Bags',
    issuedTo: 'user-3',
    issuedToName: 'Raj Patel',
    issuedAt: '2024-01-28',
    purpose: 'Foundation work for Tower A',
    createdBy: 'user-4',
    createdAt: '2024-01-28T09:00:00Z',
  },
];

export const transfers: Transfer[] = [
  {
    id: 'tfr-1',
    code: 'TFR/2024/001',
    itemId: 'item-3',
    itemName: 'Bricks Red Clay',
    fromLoc: 'Site Store A',
    fromProjectId: 'proj-1',
    toLoc: 'Site Store B',
    toProjectId: 'proj-2',
    qty: 5000,
    date: '2024-02-01',
    status: 'Completed',
    createdBy: 'user-4',
    createdAt: '2024-02-01T11:00:00Z',
  },
];
