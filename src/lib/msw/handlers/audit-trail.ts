import { http, HttpResponse } from 'msw';
import { auditTrail } from '../data/audit-trail';

export const auditTrailHandlers = [
  http.get('/api/audit-trail', () => {
    return HttpResponse.json(auditTrail);
  }),

  http.get('/api/audit-trail/:id', ({ params }) => {
    const entry = auditTrail.find((e) => e.id === params.id);
    if (!entry) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(entry);
  }),
];
