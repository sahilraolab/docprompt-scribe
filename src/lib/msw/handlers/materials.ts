import { http, HttpResponse } from 'msw';
import { materials } from '../data/materials';
import { boqs } from '../data/boq';

export const materialHandlers = [
  // Material Master endpoints
  http.get('/api/materials', () => {
    return HttpResponse.json({ data: materials, total: materials.length });
  }),

  http.get('/api/materials/:id', ({ params }) => {
    const material = materials.find((m) => m.id === params.id);
    if (!material) {
      return HttpResponse.json({ error: 'Material not found' }, { status: 404 });
    }
    return HttpResponse.json(material);
  }),

  http.get('/api/materials/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    const filtered = materials.filter((m) => 
      m.name.toLowerCase().includes(query) || 
      m.code.toLowerCase().includes(query)
    );
    return HttpResponse.json({ data: filtered });
  }),

  http.post('/api/materials', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: `mat-${Date.now()}` }, { status: 201 });
  }),

  http.put('/api/materials/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: params.id });
  }),

  http.delete('/api/materials/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  // BOQ endpoints
  http.get('/api/engineering/boq', () => {
    return HttpResponse.json({ data: boqs, total: boqs.length });
  }),

  http.get('/api/engineering/boq/:id', ({ params }) => {
    const boq = boqs.find((b) => b.id === params.id);
    if (!boq) {
      return HttpResponse.json({ error: 'BOQ not found' }, { status: 404 });
    }
    return HttpResponse.json(boq);
  }),

  http.post('/api/engineering/boq', async ({ request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: `boq-${Date.now()}` }, { status: 201 });
  }),

  http.put('/api/engineering/boq/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ ...data, id: params.id });
  }),

  http.delete('/api/engineering/boq/:id', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/engineering/boq/:id/approve', ({ params }) => {
    const boq = boqs.find((b) => b.id === params.id);
    if (!boq) {
      return HttpResponse.json({ error: 'BOQ not found' }, { status: 404 });
    }
    return HttpResponse.json({ ...boq, status: 'Approved' });
  }),

  http.post('/api/engineering/boq/generate/:estimateId', ({ params }) => {
    return HttpResponse.json({ 
      id: `boq-${Date.now()}`,
      estimateId: params.estimateId,
      status: 'Draft'
    }, { status: 201 });
  }),

  // MR from BOQ
  http.post('/api/purchase/mrs/from-boq/:boqId', async ({ params, request }) => {
    const data = await request.json() as any;
    return HttpResponse.json({ 
      ...data,
      id: `mr-${Date.now()}`,
      boqId: params.boqId,
      source: 'BOQ',
      status: 'Draft'
    }, { status: 201 });
  }),

  http.get('/api/purchase/mrs', ({ request }) => {
    const url = new URL(request.url);
    const boqId = url.searchParams.get('boqId');
    // Return mock MRs for this BOQ
    return HttpResponse.json({ data: [], total: 0 });
  }),
];
