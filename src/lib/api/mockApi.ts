import { projects } from '../msw/data/projects';
import { users, findUserByEmail, findUserById } from '../msw/data/users';
import { suppliers } from '../msw/data/suppliers';
import { materialRequisitions, quotations, purchaseOrders } from '../msw/data/purchase';
import { contractors } from '../msw/data/contractors';
import { workOrders } from '../msw/data/contracts';
import { items, stock } from '../msw/data/site';

const MOCK_PASSWORD = 'Pass@1234';

// Simple fetch interceptor
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  // Only intercept /api/* calls
  if (!url.includes('/api/')) {
    return originalFetch(input, init);
  }

  console.log('Mock API intercepted:', url);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Auth endpoints
  if (url.includes('/api/auth/login') && init?.method === 'POST') {
    const body = JSON.parse(init.body as string);
    const user = findUserByEmail(body.email);

    if (!user || body.password !== MOCK_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = btoa(`${user.id}:${Date.now()}`);
    return new Response(
      JSON.stringify({ user, token }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (url.includes('/api/auth/me')) {
    const authHeader = init?.headers && 'Authorization' in init.headers 
      ? (init.headers as Record<string, string>)['Authorization']
      : null;
      
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const [userId] = atob(token).split(':');
      const user = findUserById(userId);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ user }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  if (url.includes('/api/auth/logout')) {
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Projects endpoints
  if (url.includes('/api/projects') && !url.match(/\/api\/projects\/[^/]+$/)) {
    return new Response(
      JSON.stringify({ data: projects, total: projects.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (url.match(/\/api\/projects\/[^/]+$/)) {
    const id = url.split('/').pop();
    const project = projects.find(p => p.id === id);
    
    if (!project) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(project),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Suppliers endpoints
  if (url.includes('/api/suppliers') && !url.match(/\/api\/suppliers\/[^/]+$/)) {
    return new Response(
      JSON.stringify({ data: suppliers, total: suppliers.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (url.match(/\/api\/suppliers\/[^/]+$/)) {
    const id = url.split('/').pop();
    const supplier = suppliers.find(s => s.id === id);
    
    if (!supplier) {
      return new Response(
        JSON.stringify({ error: 'Supplier not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(supplier),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Purchase endpoints
  if (url.includes('/api/mrs')) {
    return new Response(
      JSON.stringify({ data: materialRequisitions, total: materialRequisitions.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (url.includes('/api/quotations')) {
    return new Response(
      JSON.stringify({ data: quotations, total: quotations.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (url.includes('/api/pos') && !url.match(/\/api\/pos\/[^/]+$/)) {
    return new Response(
      JSON.stringify({ data: purchaseOrders, total: purchaseOrders.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (url.match(/\/api\/pos\/[^/]+$/)) {
    const id = url.split('/').pop();
    const po = purchaseOrders.find(p => p.id === id);
    
    if (!po) {
      return new Response(
        JSON.stringify({ error: 'PO not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(po),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Contractors endpoints
  if (url.includes('/api/contractors') && !url.match(/\/api\/contractors\/[^/]+$/)) {
    return new Response(
      JSON.stringify({ data: contractors, total: contractors.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Work Orders endpoints
  if (url.includes('/api/work-orders')) {
    return new Response(
      JSON.stringify({ data: workOrders, total: workOrders.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Site endpoints
  if (url.includes('/api/items')) {
    return new Response(
      JSON.stringify({ data: items, total: items.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (url.includes('/api/stock')) {
    return new Response(
      JSON.stringify({ data: stock, total: stock.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Default 404
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
};

export function initMockApi() {
  console.log('Mock API initialized successfully');
}
