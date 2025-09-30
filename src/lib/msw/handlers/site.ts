import { http, HttpResponse } from 'msw';
import { items, stock } from '../data/site';
import { grns, issues, transfers } from '../data/grn';
import { qcInspections } from '../data/qc';

export const siteHandlers = [
  http.get('/api/items', () => {
    return HttpResponse.json({ data: items, total: items.length });
  }),

  http.get('/api/stock', () => {
    return HttpResponse.json({ data: stock, total: stock.length });
  }),

  http.get('/api/grns', () => {
    return HttpResponse.json({ data: grns, total: grns.length });
  }),

  http.get('/api/issues', () => {
    return HttpResponse.json({ data: issues, total: issues.length });
  }),

  http.get('/api/transfers', () => {
    return HttpResponse.json({ data: transfers, total: transfers.length });
  }),

  http.get('/api/qc', () => {
    return HttpResponse.json({ data: qcInspections, total: qcInspections.length });
  }),
];
