import { http, HttpResponse } from 'msw';
import { boqs } from '../data/boq';
import { materials } from '../data/materials';

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

export const boqHandlers = [
  // ============= MATERIAL MASTER =============
  http.get(`${API_URL}/engineering/materials`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let filtered = materials;
    if (category) {
      filtered = materials.filter(m => m.category === category);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Materials fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/materials/search`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';

    const filtered = materials.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.code.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query)
    );

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Search completed successfully'
    });
  }),

  http.get(`${API_URL}/engineering/materials/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const material = materials.find(m => m.id === params.id);
    if (!material) {
      return HttpResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: material,
      message: 'Material fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/materials`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newMaterial = {
      id: `MAT-${Date.now()}`,
      code: `MAT-${materials.length + 1}`,
      ...body,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id'
    };

    materials.push(newMaterial);

    return HttpResponse.json({
      success: true,
      data: newMaterial,
      message: 'Material created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/materials/:id`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = materials.findIndex(m => m.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as any;
    materials[index] = {
      ...materials[index],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: materials[index],
      message: 'Material updated successfully'
    });
  }),

  http.delete(`${API_URL}/engineering/materials/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = materials.findIndex(m => m.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'Material not found' },
        { status: 404 }
      );
    }

    materials.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: 'Material deleted successfully'
    });
  }),

  // ============= BOQ =============
  http.get(`${API_URL}/engineering/boq`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const estimateId = url.searchParams.get('estimateId');

    let filtered = boqs;
    if (projectId) {
      filtered = filtered.filter(b => b.projectId === projectId);
    }
    if (estimateId) {
      filtered = filtered.filter(b => b.estimateId === estimateId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'BOQs fetched successfully'
    });
  }),

  http.get(`${API_URL}/engineering/boq/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const boq = boqs.find(b => b.id === params.id);
    if (!boq) {
      return HttpResponse.json(
        { success: false, message: 'BOQ not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: boq,
      message: 'BOQ fetched successfully'
    });
  }),

  http.post(`${API_URL}/engineering/boq`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newBOQ = {
      id: `BOQ-${Date.now()}`,
      code: `BOQ-${boqs.length + 1}`,
      ...body,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id'
    };

    boqs.push(newBOQ);

    return HttpResponse.json({
      success: true,
      data: newBOQ,
      message: 'BOQ created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/engineering/boq/:id`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(b => b.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'BOQ not found' },
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
      message: 'BOQ updated successfully'
    });
  }),

  http.delete(`${API_URL}/engineering/boq/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(b => b.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'BOQ not found' },
        { status: 404 }
      );
    }

    boqs.splice(index, 1);

    return HttpResponse.json({
      success: true,
      message: 'BOQ deleted successfully'
    });
  }),

  http.post(`${API_URL}/engineering/boq/:id/approve`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = boqs.findIndex(b => b.id === params.id);
    if (index === -1) {
      return HttpResponse.json(
        { success: false, message: 'BOQ not found' },
        { status: 404 }
      );
    }

    boqs[index] = {
      ...boqs[index],
      status: 'Approved'
    };

    return HttpResponse.json({
      success: true,
      data: boqs[index],
      message: 'BOQ approved successfully'
    });
  }),

  http.post(`${API_URL}/engineering/boq/generate/:estimateId`, async ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const newBOQ: any = {
      id: `BOQ-${Date.now()}`,
      projectId: 'PRJ-1',
      estimateId: params.estimateId as string,
      version: 1,
      totalCost: 0,
      items: [],
      status: 'Draft' as const,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id'
    };

    boqs.push(newBOQ);

    return HttpResponse.json({
      success: true,
      data: newBOQ,
      message: 'BOQ generated from estimate successfully'
    }, { status: 201 });
  }),
];
