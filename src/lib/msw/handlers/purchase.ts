import { http, HttpResponse } from 'msw';
import { materialRequisitions, quotations, purchaseOrders, purchaseBills } from '../data/purchase';

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
let mrs = [...materialRequisitions];
let quots = [...quotations];
let pos = [...purchaseOrders];
let bills = [...purchaseBills];
let rfqs: any[] = [];
let suppliers: any[] = [
  { id: 'sup-1', name: 'ACC Cement Ltd', code: 'ACC', contactPerson: 'Raj Kumar', email: 'raj@acc.com', phone: '9876543210', address: 'Mumbai', status: 'Active' },
  { id: 'sup-2', name: 'UltraTech Industries', code: 'UTI', contactPerson: 'Priya Sharma', email: 'priya@ultratech.com', phone: '9876543211', address: 'Delhi', status: 'Active' },
  { id: 'sup-3', name: 'Jindal Steel', code: 'JSL', contactPerson: 'Amit Verma', email: 'amit@jindal.com', phone: '9876543212', address: 'Bangalore', status: 'Active' },
];
let materialRates: any[] = [];

export const purchaseHandlers = [
  // ============= SUPPLIERS =============
  http.get(`${API_URL}/purchase/suppliers`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      data: suppliers,
      message: 'Suppliers fetched successfully'
    });
  }),

  http.get(`${API_URL}/purchase/suppliers/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const supplier = suppliers.find(s => s.id === params.id);
    if (!supplier) {
      return HttpResponse.json({ success: false, message: 'Supplier not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: supplier });
  }),

  http.post(`${API_URL}/purchase/suppliers`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newSupplier = { id: `sup-${Date.now()}`, ...body, status: 'Active' };
    suppliers.push(newSupplier);
    return HttpResponse.json({ success: true, data: newSupplier, message: 'Supplier created successfully' }, { status: 201 });
  }),

  // ============= MATERIAL REQUISITIONS =============
  http.get(`${API_URL}/purchase/requisitions`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    
    let filtered = mrs;
    if (projectId) {
      filtered = mrs.filter(m => m.projectId === projectId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Material requisitions fetched successfully'
    });
  }),

  http.get(`${API_URL}/purchase/requisitions/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const mr = mrs.find(m => m.id === params.id);
    if (!mr) {
      return HttpResponse.json({ success: false, message: 'MR not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: mr });
  }),

  http.post(`${API_URL}/purchase/requisitions`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newMR = {
      id: `mr-${Date.now()}`,
      code: `MR-${new Date().getFullYear()}-${String(mrs.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
    mrs.push(newMR as any);

    return HttpResponse.json({
      success: true,
      data: newMR,
      message: 'Material requisition created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/purchase/requisitions/:id/submit`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = mrs.findIndex(m => m.id === params.id);
    if (index !== -1) {
      (mrs[index] as any).status = 'SUBMITTED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Material requisition submitted successfully'
    });
  }),

  // ============= RFQ =============
  http.get(`${API_URL}/purchase/rfqs`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      data: rfqs,
      message: 'RFQs fetched successfully'
    });
  }),

  http.post(`${API_URL}/purchase/rfqs`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newRFQ = {
      id: `rfq-${Date.now()}`,
      ...body,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    rfqs.push(newRFQ);

    return HttpResponse.json({
      success: true,
      data: newRFQ,
      message: 'RFQ created successfully'
    }, { status: 201 });
  }),

  // ============= QUOTATIONS =============
  http.get(`${API_URL}/purchase/quotations`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const rfqId = url.searchParams.get('rfqId');
    
    let filtered = quots;
    if (rfqId) {
      filtered = quots.filter(q => (q as any).rfqId === rfqId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Quotations fetched successfully'
    });
  }),

  http.get(`${API_URL}/purchase/quotations/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const quotation = quots.find(q => q.id === params.id);
    if (!quotation) {
      return HttpResponse.json({ success: false, message: 'Quotation not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: quotation });
  }),

  http.post(`${API_URL}/purchase/quotations`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newQuotation = {
      id: `quot-${Date.now()}`,
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    quots.push(newQuotation as any);

    return HttpResponse.json({
      success: true,
      data: newQuotation,
      message: 'Quotation submitted successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/purchase/quotations/:id/approve`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = quots.findIndex(q => q.id === params.id);
    if (index !== -1) {
      (quots[index] as any).status = 'APPROVED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Quotation approved successfully'
    });
  }),

  http.put(`${API_URL}/purchase/quotations/:id/reject`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = quots.findIndex(q => q.id === params.id);
    if (index !== -1) {
      (quots[index] as any).status = 'REJECTED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Quotation rejected successfully'
    });
  }),

  // ============= COMPARATIVE STATEMENTS (removed - not in API contract) =============
  http.get(`${API_URL}/purchase/comparative-statements`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      data: [],
      message: 'Comparative statements fetched successfully'
    });
  }),

  http.get(`${API_URL}/purchase/comparative-statements/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    return HttpResponse.json({ success: false, message: 'Comparative statement not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/purchase/comparative-statements`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newCS = {
      id: `cs-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString()
    };

    return HttpResponse.json({
      success: true,
      data: newCS,
      message: 'Comparative statement created successfully'
    }, { status: 201 });
  }),

  // ============= PURCHASE ORDERS =============
  http.get(`${API_URL}/purchase/po`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    
    let filtered = pos;
    if (projectId) {
      filtered = pos.filter(p => p.projectId === projectId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Purchase orders fetched successfully'
    });
  }),

  http.get(`${API_URL}/purchase/po/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const po = pos.find(p => p.id === params.id);
    if (!po) {
      return HttpResponse.json({ success: false, message: 'PO not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: po });
  }),

  http.post(`${API_URL}/purchase/po`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    
    // Validate quotation is approved
    const quotation = quots.find(q => q.id === body.quotationId);
    if (quotation && (quotation as any).status !== 'APPROVED') {
      return HttpResponse.json({
        success: false,
        message: 'Quotation must be APPROVED to create PO'
      }, { status: 400 });
    }

    const newPO = {
      id: `po-${Date.now()}`,
      code: `PO-${new Date().getFullYear()}-${String(pos.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
    pos.push(newPO as any);

    return HttpResponse.json({
      success: true,
      data: newPO,
      message: 'Purchase order created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/purchase/po/:id/approve`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = pos.findIndex(p => p.id === params.id);
    if (index !== -1) {
      (pos[index] as any).status = 'APPROVED';
      (pos[index] as any).approvalStatus = 'APPROVED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Purchase order approved successfully'
    });
  }),

  http.put(`${API_URL}/purchase/po/:id/cancel`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = pos.findIndex(p => p.id === params.id);
    if (index !== -1) {
      (pos[index] as any).status = 'CANCELLED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Purchase order cancelled successfully'
    });
  }),

  // ============= PURCHASE BILLS =============
  http.get(`${API_URL}/purchase/bills`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const url = new URL(request.url);
    const poId = url.searchParams.get('poId');
    
    let filtered = bills;
    if (poId) {
      filtered = bills.filter(b => b.poId === poId);
    }

    return HttpResponse.json({
      success: true,
      data: filtered,
      message: 'Purchase bills fetched successfully'
    });
  }),

  http.get(`${API_URL}/purchase/bills/:id`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const bill = bills.find(b => b.id === params.id);
    if (!bill) {
      return HttpResponse.json({ success: false, message: 'Purchase bill not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: bill });
  }),

  http.post(`${API_URL}/purchase/bills`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newBill = {
      id: `pb-${Date.now()}`,
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    bills.push(newBill as any);

    return HttpResponse.json({
      success: true,
      data: newBill,
      message: 'Purchase bill created successfully'
    }, { status: 201 });
  }),

  http.put(`${API_URL}/purchase/bills/:id/post`, ({ request, params }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const index = bills.findIndex(b => b.id === params.id);
    if (index !== -1) {
      if ((bills[index] as any).status === 'POSTED') {
        return HttpResponse.json({
          success: false,
          message: 'Bill already posted, cannot repost'
        }, { status: 400 });
      }
      (bills[index] as any).status = 'POSTED';
    }

    return HttpResponse.json({
      success: true,
      message: 'Purchase bill posted to accounts successfully'
    });
  }),

  // ============= MATERIAL RATES =============
  http.get(`${API_URL}/purchase/material-rates`, ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    return HttpResponse.json({
      success: true,
      data: materialRates,
      message: 'Material rates fetched successfully'
    });
  }),

  http.post(`${API_URL}/purchase/material-rates`, async ({ request }) => {
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json() as any;
    const newRate = {
      id: `rate-${Date.now()}`,
      ...body,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    materialRates.push(newRate);

    return HttpResponse.json({
      success: true,
      data: newRate,
      message: 'Material rate created successfully'
    }, { status: 201 });
  }),
];
