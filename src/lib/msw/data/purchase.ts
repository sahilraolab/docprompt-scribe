import { MR, Quotation, PO, PurchaseBill } from '@/types';

export const materialRequisitions: MR[] = [
  {
    id: 'mr-1',
    code: 'MR-2024-001',
    projectId: 'proj-1',
    projectName: 'Skyline Towers',
    items: [
      {
        id: 'mr-item-1',
        itemId: 'item-1',
        itemName: 'Cement ACC',
        description: 'ACC Cement 53 Grade',
        qty: 1000,
        uom: 'Bags',
        requiredBy: '2024-12-31',
      },
      {
        id: 'mr-item-2',
        itemId: 'item-2',
        itemName: 'Steel TMT',
        description: 'TMT Bars 12mm',
        qty: 50,
        uom: 'MT',
        requiredBy: '2024-12-31',
      },
    ],
    status: 'Approved',
    approvalStatus: 'Approved',
    requestedBy: 'user-4',
    requestedByName: 'Amit Patel',
    approvedBy: 'user-6',
    approvedAt: '2024-11-02T10:00:00Z',
    createdBy: 'user-4',
    createdAt: '2024-11-01T10:00:00Z',
  },
];

export const quotations: Quotation[] = [
  {
    id: 'quot-1',
    supplierId: 'sup-1',
    supplierName: 'ACC Cement Ltd',
    mrId: 'mr-1',
    mrCode: 'MR-2024-001',
    expiresAt: '2024-12-31',
    items: [
      {
        id: 'quot-item-1',
        mrItemId: 'mr-item-1',
        description: 'ACC Cement 53 Grade',
        qty: 1000,
        uom: 'Bags',
        rate: 380,
        taxPct: 18,
        amount: 380000,
      },
    ],
    notes: 'Free delivery within Mumbai',
    status: 'Active',
    createdBy: 'user-3',
    createdAt: '2024-11-03T10:00:00Z',
  },
];

export const purchaseOrders: PO[] = [
  {
    id: 'po-1',
    code: 'PO-2024-001',
    supplierId: 'sup-1',
    supplierName: 'ACC Cement Ltd',
    projectId: 'proj-1',
    projectName: 'Skyline Towers',
    items: [
      {
        id: 'po-item-1',
        description: 'ACC Cement 53 Grade',
        qty: 1000,
        uom: 'Bags',
        rate: 380,
        taxPct: 18,
        amount: 380000,
      },
    ],
    status: 'Approved',
    approvalStatus: 'Approved',
    total: 380000,
    taxTotal: 68400,
    grandTotal: 448400,
    deliveryDate: '2024-12-15',
    terms: 'Payment within 30 days of delivery',
    approvedBy: 'user-6',
    approvedAt: '2024-11-05T10:00:00Z',
    createdBy: 'user-3',
    createdAt: '2024-11-04T10:00:00Z',
  },
];

export const purchaseBills: PurchaseBill[] = [];
