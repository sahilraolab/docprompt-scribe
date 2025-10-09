import { http, HttpResponse } from 'msw';
import { materialRates } from '../data/material-rates';

export const materialRateHandlers = [
  http.get('/api/material-rates', () => {
    return HttpResponse.json({ data: materialRates, total: materialRates.length });
  }),

  http.get('/api/material-rates/:id', ({ params }) => {
    const rate = materialRates.find((r) => r.id === params.id);
    if (!rate) {
      return HttpResponse.json({ error: 'Rate not found' }, { status: 404 });
    }
    return HttpResponse.json(rate);
  }),

  http.post('/api/material-rates', async ({ request }) => {
    const data = await request.json() as any;
    const newRate = {
      id: `rate-${Date.now()}`,
      ...data,
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
    };
    materialRates.push(newRate);
    return HttpResponse.json(newRate, { status: 201 });
  }),

  http.put('/api/material-rates/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    const index = materialRates.findIndex((r) => r.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Rate not found' }, { status: 404 });
    }
    materialRates[index] = { ...materialRates[index], ...data } as any;
    return HttpResponse.json(materialRates[index]);
  }),

  http.delete('/api/material-rates/:id', ({ params }) => {
    const index = materialRates.findIndex((r) => r.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Rate not found' }, { status: 404 });
    }
    materialRates.splice(index, 1);
    return HttpResponse.json({ message: 'Rate deleted successfully' });
  }),
];
