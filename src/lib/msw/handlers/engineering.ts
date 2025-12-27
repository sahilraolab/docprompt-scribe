import { http, HttpResponse } from 'msw';
import { projects } from '../data/projects';
import { boqs } from '../data/boq';

const API_URL = 'http://88.222.244.251:5005/api';

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

// Mock data stores
let bbsRecords: any[] = [
  { id: 1, projectId: 1, code: 'BBS-001', description: 'Foundation rebar', quantity: 5000, uomId: 1, rate: 65, amount: 325000, status: 'DRAFT' },
  { id: 2, projectId: 1, code: 'BBS-002', description: 'Column rebar', quantity: 3000, uomId: 1, rate: 68, amount: 204000, status: 'APPROVED' },
];

let budgets: any[] = [];

let drawings: any[] = [
  { id: 1, projectId: 1, title: 'Foundation Plan', drawingNo: 'DWG-001', discipline: 'STRUCTURAL', status: 'APPROVED' },
  { id: 2, projectId: 1, title: 'Column Layout', drawingNo: 'DWG-002', discipline: 'STRUCTURAL', status: 'DRAFT' },
];

let compliances: any[] = [
  { id: 1, projectId: 1, type: 'RERA', documentRef: 'RERA/2024/001', validTill: '2025-12-31' },
  { id: 2, projectId: 1, type: 'ENVIRONMENT', documentRef: 'ENV/2024/001', validTill: '2025-06-30' },
];

let estimates: any[] = [
  { id: 1, projectId: 1, name: 'Phase 1 Estimate', baseAmount: 50000000, status: 'DRAFT' },
];

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

  // ============= BUDGET =============
  http.get(`${API_URL}/engineering/budget/:projectId`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const budget = budgets.find(b => String(b.projectId) === String(params.projectId));
    return HttpResponse.json({
      success: true,
      data: budget || null,
      message: 'Budget fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/budget`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newBudget = {
      id: Date.now(),
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
    budgets.push(newBudget);

    return HttpResponse.json({
      success: true,
      data: newBudget,
      message: 'Budget created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/budget/:id/approve`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = budgets.findIndex(b => String(b.id) === String(params.id));
    if (index !== -1) {
      budgets[index].status = 'APPROVED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Budget approved successfully'
    });
  }),

  // ============= ESTIMATES =============
  http.get(`${API_URL}/engineering/estimate`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    let filtered = estimates;
    if (projectId) {
      filtered = estimates.filter(e => String(e.projectId) === projectId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Estimates fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/estimate`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newEstimate = {
      id: Date.now(),
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
    estimates.push(newEstimate);

    return HttpResponse.json({
      success: true,
      data: newEstimate,
      message: 'Estimate created successfully'
    }, { status: 201 });
  }),

  http.post(`${API_URL}/engineering/estimate/version`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newVersion = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: newVersion,
      message: 'Estimate version added successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/estimate/:id/approve`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = estimates.findIndex(e => String(e.id) === String(params.id));
    if (index !== -1) {
      estimates[index].status = 'FINAL';
    }

    return HttpResponse.json({
      success: true,
      message: 'Estimate approved successfully'
    });
  }),

  // ============= BBS =============
  http.get(`${API_URL}/engineering/bbs`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    let filtered = bbsRecords;
    if (projectId) {
      filtered = bbsRecords.filter(b => String(b.projectId) === projectId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'BBS records fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/bbs/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const bbs = bbsRecords.find(b => String(b.id) === String(params.id));
    return HttpResponse.json({
      success: true,
      data: bbs || null,
      message: 'BBS fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/bbs`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const amount = (body.quantity || 0) * (body.rate || 0);
    const newBBS = {
      id: Date.now(),
      ...body,
      amount,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
    bbsRecords.push(newBBS);

    return HttpResponse.json({
      success: true,
      data: newBBS,
      message: 'BBS created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/bbs/:id`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = bbsRecords.findIndex(b => String(b.id) === String(params.id));
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'BBS not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as any;
    const amount = (body.quantity || bbsRecords[index].quantity) * (body.rate || bbsRecords[index].rate);
    bbsRecords[index] = { ...bbsRecords[index], ...body, amount };

    return HttpResponse.json({
      success: true,
      data: bbsRecords[index],
      message: 'BBS updated successfully'
    });
  }),

  http.delete(`${API_URL}/engineering/bbs/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    bbsRecords = bbsRecords.filter(b => String(b.id) !== String(params.id));

    return HttpResponse.json({
      success: true,
      message: 'BBS deleted successfully'
    });
  }),

  // ============= DRAWINGS =============
  http.get(`${API_URL}/engineering/drawings`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    let filtered = drawings;
    if (projectId) {
      filtered = drawings.filter(d => String(d.projectId) === projectId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Drawings fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/drawings/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const drawing = drawings.find(d => String(d.id) === String(params.id));
    return HttpResponse.json({
      success: true,
      data: drawing || null,
      message: 'Drawing fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/drawings`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newDrawing = {
      id: Date.now(),
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
    drawings.push(newDrawing);

    return HttpResponse.json({
      success: true,
      data: newDrawing,
      message: 'Drawing created successfully'
    }, { status: 201 });
  }),

  http.post(`${API_URL}/engineering/drawings/revision`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const revision = {
      id: Date.now(),
      ...body,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: revision,
      message: 'Drawing revision added successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/drawings/:id/approve`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = drawings.findIndex(d => String(d.id) === String(params.id));
    if (index !== -1) {
      drawings[index].status = 'APPROVED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Drawing approved successfully'
    });
  }),

  // ============= COMPLIANCE =============
  http.get(`${API_URL}/engineering/compliance`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    let filtered = compliances;
    if (projectId) {
      filtered = compliances.filter(c => String(c.projectId) === projectId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Compliance records fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/compliance/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const compliance = compliances.find(c => String(c.id) === String(params.id));
    return HttpResponse.json({
      success: true,
      data: compliance || null,
      message: 'Compliance fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/compliance`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newCompliance = {
      id: Date.now(),
      ...body,
      createdAt: new Date().toISOString()
    };
    compliances.push(newCompliance);

    return HttpResponse.json({
      success: true,
      data: newCompliance,
      message: 'Compliance created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/compliance/:id`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = compliances.findIndex(c => String(c.id) === String(params.id));
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Compliance not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as any;
    compliances[index] = { ...compliances[index], ...body };

    return HttpResponse.json({
      success: true,
      data: compliances[index],
      message: 'Compliance updated successfully'
    });
  }),

  http.delete(`${API_URL}/engineering/compliance/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    compliances = compliances.filter(c => String(c.id) !== String(params.id));

    return HttpResponse.json({
      success: true,
      message: 'Compliance deleted successfully'
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

  // ============= BOQ =============
  http.get(`${API_URL}/engineering/boq`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      data: boqs,
      message: 'BOQ fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/boq/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const boq = boqs.find(b => b.id === params.id);
    return HttpResponse.json({
      success: true,
      data: boq || null,
      message: 'BOQ fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/boq`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newBOQ = {
      id: `BOQ-${Date.now()}`,
      ...body,
      status: 'Draft',
      createdAt: new Date().toISOString()
    };
    boqs.push(newBOQ);

    return HttpResponse.json({
      success: true,
      data: newBOQ,
      message: 'BOQ created successfully'
    }, { status: 201 });
  }),
];
