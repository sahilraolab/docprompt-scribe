import { http, HttpResponse } from 'msw';
import { documents } from '../data/documents';

export const documentsHandlers = [
  http.get('/api/documents', () => {
    return HttpResponse.json(documents);
  }),

  http.get('/api/documents/:id', ({ params }) => {
    const document = documents.find((d) => d.id === params.id);
    if (!document) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(document);
  }),

  http.post('/api/documents', async ({ request }) => {
    const data = (await request.json()) as any;
    const newDocument = {
      id: String(documents.length + 1),
      ...data,
      uploadedAt: new Date().toISOString(),
    };
    documents.push(newDocument);
    return HttpResponse.json(newDocument, { status: 201 });
  }),

  http.put('/api/documents/:id', async ({ params, request }) => {
    const data = (await request.json()) as any;
    const index = documents.findIndex((d) => d.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    documents[index] = { ...documents[index], ...data };
    return HttpResponse.json(documents[index]);
  }),

  http.delete('/api/documents/:id', ({ params }) => {
    const index = documents.findIndex((d) => d.id === params.id);
    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }
    documents.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
