import { http, HttpResponse } from 'msw';
import { contractors, labourRates, workOrders, raBills } from '../data/contractors';

export const contractorHandlers = [
  http.get('/api/contractors', () => {
    return HttpResponse.json({ data: contractors, total: contractors.length });
  }),

  http.get('/api/contractors/:id', ({ params }) => {
    const contractor = contractors.find((c) => c.id === params.id);
    if (!contractor) {
      return HttpResponse.json({ error: 'Contractor not found' }, { status: 404 });
    }
    return HttpResponse.json(contractor);
  }),

  http.get('/api/labour-rates', () => {
    return HttpResponse.json({ data: labourRates, total: labourRates.length });
  }),

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
];
