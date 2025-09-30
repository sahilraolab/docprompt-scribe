import { http, HttpResponse } from 'msw';

export const workflowHandlers = [
  http.get('/api/approvals', () => {
    return HttpResponse.json({ data: [], total: 0 });
  }),

  http.get('/api/workflows', () => {
    return HttpResponse.json({ data: [], total: 0 });
  }),
];
