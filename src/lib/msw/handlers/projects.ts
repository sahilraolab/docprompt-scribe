import { http, HttpResponse } from 'msw';
import { projects, estimates, documents, plans } from '../data/projects';

export const projectHandlers = [
  // Projects
  http.get('/api/engineering/projects', () => {
    return HttpResponse.json({ data: projects, total: projects.length });
  }),

  http.get('/api/engineering/projects/:id', ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return HttpResponse.json(project);
  }),

  http.post('/api/engineering/projects', async ({ request }) => {
    const data = await request.json() as any;
    const newProject = {
      id: `proj-${Date.now()}`,
      ...(data as object),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.push(newProject as any);
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.put('/api/engineering/projects/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    const index = projects.findIndex((p) => p.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    projects[index] = { ...projects[index], ...(data as object), updatedAt: new Date().toISOString() } as any;
    return HttpResponse.json(projects[index]);
  }),

  http.delete('/api/engineering/projects/:id', ({ params }) => {
    const index = projects.findIndex((p) => p.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    projects.splice(index, 1);
    return HttpResponse.json({ message: 'Project deleted' });
  }),

  // Estimates
  http.get('/api/engineering/estimates', () => {
    return HttpResponse.json({ data: estimates });
  }),

  http.get('/api/engineering/estimates/:id', ({ params }) => {
    const estimate = estimates.find((e) => e.id === params.id);
    if (!estimate) {
      return HttpResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }
    return HttpResponse.json(estimate);
  }),

  http.post('/api/engineering/estimates', async ({ request }) => {
    const data = await request.json() as any;
    const newEstimate = {
      id: `est-${Date.now()}`,
      ...(data as object),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    estimates.push(newEstimate as any);
    return HttpResponse.json(newEstimate, { status: 201 });
  }),

  http.put('/api/engineering/estimates/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    const index = estimates.findIndex((e) => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }
    estimates[index] = { ...estimates[index], ...(data as object), updatedAt: new Date().toISOString() } as any;
    return HttpResponse.json(estimates[index]);
  }),

  http.delete('/api/engineering/estimates/:id', ({ params }) => {
    const index = estimates.findIndex((e) => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Estimate not found' }, { status: 404 });
    }
    estimates.splice(index, 1);
    return HttpResponse.json({ message: 'Estimate deleted' });
  }),

  // Documents
  http.get('/api/engineering/documents', () => {
    return HttpResponse.json({ data: documents });
  }),

  http.get('/api/engineering/documents/:id', ({ params }) => {
    const document = documents.find((d) => d.id === params.id);
    if (!document) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return HttpResponse.json(document);
  }),

  http.post('/api/engineering/documents', async ({ request }) => {
    const formData = await request.formData();
    const newDocument = {
      id: `doc-${Date.now()}`,
      name: formData.get('name'),
      projectId: formData.get('projectId'),
      type: formData.get('type'),
      version: parseInt(formData.get('version') as string) || 1,
      url: `https://example.com/documents/${Date.now()}.pdf`,
      size: 1024000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    documents.push(newDocument as any);
    return HttpResponse.json(newDocument, { status: 201 });
  }),

  http.put('/api/engineering/documents/:id', async ({ params, request }) => {
    const data = await request.json() as any;
    const index = documents.findIndex((d) => d.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    documents[index] = { ...documents[index], ...(data as object), updatedAt: new Date().toISOString() } as any;
    return HttpResponse.json(documents[index]);
  }),

  http.delete('/api/engineering/documents/:id', ({ params }) => {
    const index = documents.findIndex((d) => d.id === params.id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    documents.splice(index, 1);
    return HttpResponse.json({ message: 'Document deleted' });
  }),

  // Legacy endpoints for compatibility
  http.get('/api/projects', () => {
    return HttpResponse.json({ data: projects, total: projects.length });
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const project = projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return HttpResponse.json(project);
  }),

  http.get('/api/projects/:id/estimates', ({ params }) => {
    const projectEstimates = estimates.filter((e) => e.projectId === params.id);
    return HttpResponse.json({ data: projectEstimates });
  }),

  http.get('/api/projects/:id/documents', ({ params }) => {
    const projectDocs = documents.filter((d) => d.projectId === params.id);
    return HttpResponse.json({ data: projectDocs });
  }),

  http.get('/api/projects/:id/plans', ({ params }) => {
    const projectPlans = plans.filter((p) => p.projectId === params.id);
    return HttpResponse.json({ data: projectPlans });
  }),

  http.get('/api/estimates', () => {
    return HttpResponse.json({ data: estimates });
  }),
];
