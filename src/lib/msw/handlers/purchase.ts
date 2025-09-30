import { http, HttpResponse } from 'msw';
import { materialRequisitions, quotations, purchaseOrders, purchaseBills, comparativeStatements } from '../data/purchase';

export const purchaseHandlers = [
  http.get('/api/mrs', () => {
    return HttpResponse.json({ data: materialRequisitions, total: materialRequisitions.length });
  }),

  http.get('/api/quotations', () => {
    return HttpResponse.json({ data: quotations, total: quotations.length });
  }),

  http.get('/api/pos', () => {
    return HttpResponse.json({ data: purchaseOrders, total: purchaseOrders.length });
  }),

  http.get('/api/pos/:id', ({ params }) => {
    const po = purchaseOrders.find((p) => p.id === params.id);
    if (!po) {
      return HttpResponse.json({ error: 'PO not found' }, { status: 404 });
    }
    return HttpResponse.json(po);
  }),

  http.get('/api/purchase-bills', () => {
    return HttpResponse.json({ data: purchaseBills, total: purchaseBills.length });
  }),

  http.get('/api/comparative-statements', () => {
    return HttpResponse.json({ data: comparativeStatements, total: comparativeStatements.length });
  }),

  http.get('/api/comparative-statements/:id', ({ params }) => {
    const cs = comparativeStatements.find((c) => c.id === params.id);
    if (!cs) {
      return HttpResponse.json({ error: 'Comparative statement not found' }, { status: 404 });
    }
    return HttpResponse.json(cs);
  }),
];
