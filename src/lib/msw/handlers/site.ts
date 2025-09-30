import { http, HttpResponse } from 'msw';
import { items, stock, grns, issues, transfers } from '../data/site';

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
];
