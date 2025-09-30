import { http, HttpResponse } from 'msw';

export const accountsHandlers = [
  http.get('/api/accounts', () => {
    return HttpResponse.json({ data: [], total: 0 });
  }),

  http.get('/api/journals', () => {
    return HttpResponse.json({ data: [], total: 0 });
  }),
];
