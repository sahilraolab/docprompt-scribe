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
];
