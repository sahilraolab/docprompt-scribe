import { http, HttpResponse } from 'msw';
import { labourRates } from '../data/labour-rates';

export const labourRatesHandlers = [
  http.get('/api/labour-rates', () => {
    return HttpResponse.json(labourRates);
  }),

  http.get('/api/labour-rates/:id', ({ params }) => {
    const rate = labourRates.find((r) => r.id === params.id);
    if (!rate) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(rate);
  }),

  http.post('/api/labour-rates', async ({ request }) => {
    const data = (await request.json()) as any;
    const newRate = {
      id: String(labourRates.length + 1),
      ...data,
      status: 'Active',
    };
    labourRates.push(newRate);
    return HttpResponse.json(newRate, { status: 201 });
  }),

  http.put('/api/labour-rates/:id', async ({ params, request }) => {
    const data = (await request.json()) as any;
    const index = labourRates.findIndex((r) => r.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    labourRates[index] = { ...labourRates[index], ...data };
    return HttpResponse.json(labourRates[index]);
  }),

  http.delete('/api/labour-rates/:id', ({ params }) => {
    const index = labourRates.findIndex((r) => r.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    labourRates.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
