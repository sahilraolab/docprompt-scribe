import { http, HttpResponse } from 'msw';
import { projects } from '../data/projects';
import { boqs } from '../data/boq';

const API_URL = 'http://localhost:5005/api';

// Helper to check auth
function checkAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return HttpResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  return null;
}

export const engineeringHandlers = [
  // ============= PROJECTS =============
  http.get(`${API_URL}/engineering/projects`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      data: projects,
      message: 'Projects fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/projects/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const project = projects.find(p => p.id === params.id);
    if (!project) {
      return HttpResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: project,
      message: 'Project fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/projects`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newProject = {
      id: `PRJ-${Date.now()}`,
      code: `PRJ-${projects.length + 1}`,
      ...body,
      status: body.status || 'Planning',
      budget: body.budget || 0,
      spent: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id'
    };

    projects.push(newProject);

    return HttpResponse.json({
      success: true,
      data: newProject,
      message: 'Project created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/projects/:id`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = projects.findIndex(p => p.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as any;
    projects[index] = {
      ...projects[index],
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user-id'
    };

    return HttpResponse.json({
      success: true,
      data: projects[index],
      message: 'Project updated successfully'
    });
  }),

  http.delete(`${API_URL}/engineering/projects/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = projects.findIndex(p => p.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      );
    }

    projects.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  }),

  // ============= ESTIMATES =============
  http.get(`${API_URL}/engineering/estimates`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    let estimates = boqs; // Using BOQ data as estimates
    if (projectId) {
      estimates = estimates.filter(e => e.projectId === projectId);
    }

    return HttpResponse.json({
      success: true,
      data: estimates,
      message: 'Estimates fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/estimates/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const estimate = boqs.find(e => e.id === params.id);
    if (!estimate) {
      return HttpResponse.json(
        { success: false, message: 'Estimate not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: estimate,
      message: 'Estimate fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/estimates`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newEstimate = {
      id: `EST-${Date.now()}`,
      code: `EST-${boqs.length + 1}`,
      ...body,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id'
    };

    boqs.push(newEstimate);

    return HttpResponse.json({
      success: true,
      data: newEstimate,
      message: 'Estimate created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/estimates/:id`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(e => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Estimate not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as any;
    boqs[index] = {
      ...boqs[index],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: boqs[index],
      message: 'Estimate updated successfully'
    });
  }),

  http.delete(`${API_URL}/engineering/estimates/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(e => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Estimate not found' },
        { status: 404 }
      );
    }

    boqs.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: 'Estimate deleted successfully'
    });
  }),

  http.post(`${API_URL}/engineering/estimates/:id/submit`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(e => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Estimate not found' },
        { status: 404 }
      );
    }

    boqs[index] = {
      ...boqs[index],
      status: 'Draft'
    };

    return HttpResponse.json({
      success: true,
      data: boqs[index],
      message: 'Estimate submitted for approval'
    });
  }),

  http.post(`${API_URL}/engineering/estimates/:id/approve`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(e => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Estimate not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as any;
    boqs[index] = {
      ...boqs[index],
      status: 'Approved'
    };

    return HttpResponse.json({
      success: true,
      data: boqs[index],
      message: 'Estimate approved successfully'
    });
  }),

  http.post(`${API_URL}/engineering/estimates/:id/reject`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(e => e.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Estimate not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as any;
    boqs[index] = {
      ...boqs[index],
      status: 'Draft'
    };

    return HttpResponse.json({
      success: true,
      data: boqs[index],
      message: 'Estimate rejected'
    });
  }),

  // ============= DOCUMENTS =============
  http.get(`${API_URL}/engineering/documents`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    const documents = [
      {
        id: 'DOC-1',
        code: 'DOC-001',
        projectId: 'PRJ-1',
        name: 'Site Plan.pdf',
        type: 'Drawing',
        fileUrl: '/uploads/site-plan.pdf',
        version: '1.0',
        uploadedBy: 'user-1',
        uploadedAt: new Date().toISOString()
      }
    ];

    const filtered = projectId 
      ? documents.filter(d => d.projectId === projectId)
      : documents;

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Documents fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/documents`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    // Handle multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const projectId = formData.get('projectId');
    const type = formData.get('type');

    const newDoc = {
      id: `DOC-${Date.now()}`,
      code: `DOC-${Date.now()}`,
      projectId: projectId as string,
      name: file ? (file as File).name : 'document.pdf',
      type: type as string,
      fileUrl: `/uploads/${file ? (file as File).name : 'document.pdf'}`,
      version: '1.0',
      uploadedBy: 'current-user-id',
      uploadedAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: newDoc,
      message: 'Document uploaded successfully'
    }, { status: 201 });
  }),

  // ============= PLANS =============
  http.get(`${API_URL}/engineering/plans`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    const plans = [
      {
        id: 'PLAN-1',
        code: 'PLAN-001',
        projectId: 'PRJ-1',
        name: 'Q1 Construction Plan',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        status: 'Active',
        createdAt: new Date().toISOString()
      }
    ];

    const filtered = projectId 
      ? plans.filter(p => p.projectId === projectId)
      : plans;

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Plans fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/plans`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newPlan = {
      id: `PLAN-${Date.now()}`,
      code: `PLAN-${Date.now()}`,
      ...body,
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: newPlan,
      message: 'Plan created successfully'
    }, { status: 201 });
  }),
];
