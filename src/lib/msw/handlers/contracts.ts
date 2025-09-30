import { http, HttpResponse } from 'msw';
import { workOrders, raBills, advances, labourRates } from '../data/contracts';

export const contractsHandlers = [
  http.get('/api/work-orders', () => {
    return HttpResponse.json({ data: workOrders, total: workOrders.length });
  }),

  http.get('/api/work-orders/:id', ({ params }) => {
    const wo = workOrders.find((w) => w.id === params.id);
    if (!wo) {
      return HttpResponse.json({ error: 'Work order not found' }, { status: 404 });
    }
    return HttpResponse.json(wo);
  }),

  http.get('/api/ra-bills', () => {
    return HttpResponse.json({ data: raBills, total: raBills.length });
  }),

  http.get('/api/advances', () => {
    return HttpResponse.json({ data: advances, total: advances.length });
  }),

  http.get('/api/labour-rates', () => {
    return HttpResponse.json({ data: labourRates, total: labourRates.length });
  }),
];
