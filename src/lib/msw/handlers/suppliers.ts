import { http, HttpResponse } from 'msw';
import { suppliers } from '../data/suppliers';

export const supplierHandlers = [
  http.get('/api/suppliers', () => {
    return HttpResponse.json({ data: suppliers, total: suppliers.length });
  }),

  http.get('/api/suppliers/:id', ({ params }) => {
    const supplier = suppliers.find((s) => s.id === params.id);
    if (!supplier) {
      return HttpResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }
    return HttpResponse.json(supplier);
  }),
];
