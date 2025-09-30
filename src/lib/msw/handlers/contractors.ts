import { http, HttpResponse } from 'msw';
import { contractors } from '../data/contractors';

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
];
