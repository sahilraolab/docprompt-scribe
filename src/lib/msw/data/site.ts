import { Item, Stock, GRN, Issue, Transfer } from '@/types';

export const items: Item[] = [
  {
    id: 'item-1',
    name: 'ACC Cement 53 Grade',
    code: 'CEM-ACC-53',
    sku: 'ACC53G',
    uom: 'Bags',
    category: 'Cement',
    minQty: 100,
    currentStock: 500,
  },
  {
    id: 'item-2',
    name: 'TMT Bars 12mm',
    code: 'STL-TMT-12',
    sku: 'TMT12MM',
    uom: 'MT',
    category: 'Steel',
    minQty: 10,
    currentStock: 25,
  },
  {
    id: 'item-3',
    name: 'Bricks Red Clay',
    code: 'BRK-RED-STD',
    sku: 'BRK001',
    uom: 'Nos',
    category: 'Bricks',
    minQty: 10000,
    currentStock: 50000,
  },
];

export const stock: Stock[] = [
  {
    id: 'stk-1',
    itemId: 'item-1',
    itemName: 'ACC Cement 53 Grade',
    location: 'Site Store A',
    projectId: 'proj-1',
    projectName: 'Skyline Towers',
    qty: 500,
    minQty: 100,
    uom: 'Bags',
    value: 190000,
  },
  {
    id: 'stk-2',
    itemId: 'item-2',
    itemName: 'TMT Bars 12mm',
    location: 'Site Store A',
    projectId: 'proj-1',
    projectName: 'Skyline Towers',
    qty: 25,
    minQty: 10,
    uom: 'MT',
    value: 1625000,
  },
];

export const grns: GRN[] = [];

export const issues: Issue[] = [];

export const transfers: Transfer[] = [];
