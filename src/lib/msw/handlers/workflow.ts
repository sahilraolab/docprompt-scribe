import { http, HttpResponse } from 'msw';
import { workflowConfigs, approvalRequests } from '../data/workflow';

export const workflowHandlers = [
  http.get('/api/workflow-configs', () => {
    return HttpResponse.json({ data: workflowConfigs });
  }),

  http.get('/api/approval-requests', () => {
    return HttpResponse.json({ data: approvalRequests });
  }),

  http.post('/api/approval-requests/:id/approve', async ({ params, request }) => {
    const body = await request.json() as { remarks?: string };
    const approval = approvalRequests.find(a => a.id === params.id);
    
    if (!approval) {
      return HttpResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    // Update approval status
    approval.status = 'Approved';
    approval.approvedAt = new Date().toISOString();
    approval.remarks = body.remarks;

    return HttpResponse.json({ 
      success: true,
      data: approval,
      message: 'Request approved successfully'
    });
  }),

  http.post('/api/approval-requests/:id/reject', async ({ params, request }) => {
    const body = await request.json() as { remarks?: string };
    const approval = approvalRequests.find(a => a.id === params.id);
    
    if (!approval) {
      return HttpResponse.json({ error: 'Approval request not found' }, { status: 404 });
    }

    // Update approval status
    approval.status = 'Rejected';
    approval.approvedAt = new Date().toISOString();
    approval.remarks = body.remarks;

    return HttpResponse.json({ 
      success: true,
      data: approval,
      message: 'Request rejected successfully'
    });
  }),

  // Legacy endpoints for backward compatibility
  http.get('/api/approvals', () => {
    return HttpResponse.json({ data: approvalRequests, total: approvalRequests.length });
  }),

  http.get('/api/workflows', () => {
    return HttpResponse.json({ data: workflowConfigs, total: workflowConfigs.length });
  }),
];
