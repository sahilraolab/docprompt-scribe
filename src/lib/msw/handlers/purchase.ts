import { http, HttpResponse } from 'msw';
import { materialRequisitions, quotations, purchaseOrders, purchaseBills, comparativeStatements } from '../data/purchase';

export const purchaseHandlers = [
  // Material Requisitions
  http.get('/api/mrs', () => {
    return HttpResponse.json({ data: materialRequisitions, total: materialRequisitions.length });
  }),

  http.get('/api/mrs/:id', ({ params }) => {
    const mr = materialRequisitions.find((m) => m.id === params.id);
    if (!mr) {
      return HttpResponse.json({ error: 'MR not found' }, { status: 404 });
    }
    return HttpResponse.json(mr);
  }),

  http.post('/api/mrs', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: 'new-mr-id', ...data } });
  }),

  http.put('/api/mrs/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...data } });
  }),

  // Quotations
  http.get('/api/quotations', () => {
    return HttpResponse.json({ data: quotations, total: quotations.length });
  }),

  http.get('/api/quotations/:id', ({ params }) => {
    const quotation = quotations.find((q) => q.id === params.id);
    if (!quotation) {
      return HttpResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }
    return HttpResponse.json(quotation);
  }),

  http.post('/api/quotations', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: 'new-quotation-id', ...data } });
  }),

  http.put('/api/quotations/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...data } });
  }),

  // Purchase Orders
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

  http.post('/api/pos', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: 'new-po-id', ...data } });
  }),

  http.put('/api/pos/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...data } });
  }),

  // Purchase Bills
  http.get('/api/purchase-bills', () => {
    return HttpResponse.json({ data: purchaseBills, total: purchaseBills.length });
  }),

  http.get('/api/purchase-bills/:id', ({ params }) => {
    const bill = purchaseBills.find((b) => b.id === params.id);
    if (!bill) {
      return HttpResponse.json({ error: 'Purchase bill not found' }, { status: 404 });
    }
    return HttpResponse.json(bill);
  }),

  http.post('/api/purchase-bills', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: 'new-bill-id', ...data } });
  }),

  http.put('/api/purchase-bills/:id', async ({ request, params }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: params.id, ...data } });
  }),

  // Comparative Statements
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

  http.post('/api/comparative-statements', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ success: true, data: { id: 'new-cs-id', ...data } });
  }),
];
