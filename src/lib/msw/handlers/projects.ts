import { http, HttpResponse } from 'msw';
import { projects, estimates, documents, plans } from '../data/projects';

export const projectHandlers = [
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
