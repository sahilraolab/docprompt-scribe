import { http, HttpResponse } from 'msw';
import { auditTrail } from '../data/audit-trail';

export const auditTrailHandlers = [
  http.get('/api/audit-trail', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: auditTrail,
    });
  }),

  http.get('/api/audit-trail/:id', ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const entry = auditTrail.find((e) => e.id === params.id);
    if (!entry) {
      return HttpResponse.json(
        { success: false, message: 'Audit entry not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: entry,
    });
  }),
];
