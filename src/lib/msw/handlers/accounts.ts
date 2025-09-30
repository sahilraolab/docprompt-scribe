import { http, HttpResponse } from 'msw';
import { accounts, journals } from '../data/accounts';

export const accountsHandlers = [
  http.get('/api/accounts', () => {
    return HttpResponse.json({ data: accounts, total: accounts.length });
  }),

  http.get('/api/accounts/:id', ({ params }) => {
    const account = accounts.find((a) => a.id === params.id);
    if (!account) {
      return HttpResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    return HttpResponse.json(account);
  }),

  http.get('/api/journals', () => {
    return HttpResponse.json({ data: journals, total: journals.length });
  }),

  http.get('/api/journals/:id', ({ params }) => {
    const journal = journals.find((j) => j.id === params.id);
    if (!journal) {
      return HttpResponse.json({ error: 'Journal not found' }, { status: 404 });
    }
    return HttpResponse.json(journal);
  }),

  http.get('/api/ledgers', () => {
    return HttpResponse.json({ data: [], total: 0 });
  }),
];
