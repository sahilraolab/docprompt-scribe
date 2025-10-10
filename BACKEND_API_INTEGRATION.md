# Backend API Integration Guide

This document explains how the frontend integrates with the backend APIs for both the Engineering and Purchase modules.

## Architecture Overview

The application supports **two modes**:
1. **Mock Mode (Default)** - Uses MSW (Mock Service Worker) for development and testing
2. **Real Backend Mode** - Connects to actual Node.js/Express backend

## Switching Between Mock and Real Backend

### Method 1: Environment Variable
Set `VITE_USE_REAL_BACKEND` in your `.env` file:
```
VITE_USE_REAL_BACKEND=true  # Use real backend
VITE_USE_REAL_BACKEND=false # Use mock data (default)
```

### Method 2: Code Toggle
Edit `src/lib/hooks/useBackendToggle.ts`:
```typescript
export const USE_REAL_BACKEND = true; // Change to true for real backend
```

## API Integration Structure

### Engineering Module APIs

**Location:** `src/lib/api/engineeringApi.ts`

**Available APIs:**
- `projectsApi` - Projects CRUD operations
- `estimatesApi` - Estimates CRUD + workflow (submit/approve/reject)
- `documentsApi` - Document upload/management
- `plansApi` - Plans CRUD operations

**Hooks:** `src/lib/hooks/useEngineering.ts`

**Example Usage:**
```typescript
import { useProjects, useCreateProject } from '@/lib/hooks/useEngineering';

function ProjectsList() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  
  const handleCreate = (data) => {
    createProject.mutate(data);
  };
  
  // ... component code
}
```

### Purchase Module APIs

**Location:** `src/lib/api/purchaseApiBackend.ts`

**Available APIs:**
- `mrsApi` - Material Requisitions CRUD + workflow
- `quotationsApi` - Quotations CRUD
- `csApi` - Comparative Statements CRUD + supplier selection
- `posApi` - Purchase Orders CRUD + workflow
- `purchaseBillsApi` - Purchase Bills CRUD
- `itemsApi` - Items/Materials CRUD

**Hooks:** `src/lib/hooks/usePurchaseBackend.ts`

**Example Usage:**
```typescript
import { useMRs, useCreateMR, useSubmitMR } from '@/lib/hooks/usePurchaseBackend';

function MRList() {
  const { data: mrs, isLoading } = useMRs();
  const createMR = useCreateMR();
  const submitMR = useSubmitMR();
  
  const handleSubmit = (id) => {
    submitMR.mutate(id);
  };
  
  // ... component code
}
```

## Available Hooks

### Engineering Module Hooks

#### Projects
- `useProjects()` - Fetch all projects
- `useProject(id)` - Fetch single project
- `useCreateProject()` - Create project
- `useUpdateProject()` - Update project
- `useDeleteProject()` - Delete project

#### Estimates
- `useEstimates()` - Fetch all estimates
- `useEstimate(id)` - Fetch single estimate
- `useEstimatesByProject(projectId)` - Fetch estimates by project
- `useCreateEstimate()` - Create estimate
- `useUpdateEstimate()` - Update estimate
- `useDeleteEstimate()` - Delete estimate
- `useSubmitEstimate()` - Submit for approval
- `useApproveEstimate()` - Approve estimate
- `useRejectEstimate()` - Reject estimate

#### Documents
- `useDocuments()` - Fetch all documents
- `useDocument(id)` - Fetch single document
- `useDocumentsByProject(projectId)` - Fetch documents by project
- `useCreateDocument()` - Upload document (accepts FormData)
- `useUpdateDocument()` - Update document
- `useDeleteDocument()` - Delete document

#### Plans
- `usePlans()` - Fetch all plans
- `usePlan(id)` - Fetch single plan
- `usePlansByProject(projectId)` - Fetch plans by project
- `useCreatePlan()` - Create plan
- `useUpdatePlan()` - Update plan
- `useDeletePlan()` - Delete plan

### Purchase Module Hooks

#### Material Requisitions
- `useMRs()` - Fetch all MRs
- `useMR(id)` - Fetch single MR
- `useCreateMR()` - Create MR
- `useUpdateMR()` - Update MR
- `useDeleteMR()` - Delete MR
- `useSubmitMR()` - Submit for approval
- `useApproveMR()` - Approve MR
- `useRejectMR()` - Reject MR

#### Quotations
- `useQuotations()` - Fetch all quotations
- `useQuotation(id)` - Fetch single quotation
- `useQuotationsByMR(mrId)` - Fetch quotations by MR
- `useCreateQuotation()` - Create quotation
- `useUpdateQuotation()` - Update quotation
- `useDeleteQuotation()` - Delete quotation

#### Comparative Statements
- `useComparativeStatements()` - Fetch all statements
- `useComparativeStatement(id)` - Fetch single statement
- `useCreateComparativeStatement()` - Create statement
- `useUpdateComparativeStatement()` - Update statement
- `useDeleteComparativeStatement()` - Delete statement
- `useSelectSupplier()` - Select supplier from CS

#### Purchase Orders
- `usePOs()` - Fetch all POs
- `usePO(id)` - Fetch single PO
- `useCreatePO()` - Create PO
- `useUpdatePO()` - Update PO
- `useDeletePO()` - Delete PO
- `useSubmitPO()` - Submit for approval
- `useApprovePO()` - Approve PO
- `useRejectPO()` - Reject PO

#### Purchase Bills
- `usePurchaseBills()` - Fetch all bills
- `usePurchaseBill(id)` - Fetch single bill
- `usePurchaseBillsByPO(poId)` - Fetch bills by PO
- `useCreatePurchaseBill()` - Create bill
- `useUpdatePurchaseBill()` - Update bill
- `useDeletePurchaseBill()` - Delete bill

#### Items
- `useItems()` - Fetch all items
- `useItem(id)` - Fetch single item
- `useCreateItem()` - Create item
- `useUpdateItem()` - Update item
- `useDeleteItem()` - Delete item

## Backend API Endpoints

All endpoints expect:
- **Base URL:** Configured via `VITE_API_URL` (default: `http://localhost:5000/api`)
- **Authentication:** Bearer token in `Authorization` header
- **Content-Type:** `application/json` (except file uploads)

### Engineering Endpoints

```
GET    /projects                    - List all projects
GET    /projects/:id                - Get single project
POST   /projects                    - Create project
PUT    /projects/:id                - Update project
DELETE /projects/:id                - Delete project

GET    /estimates                   - List all estimates
GET    /estimates/:id               - Get single estimate
GET    /estimates?projectId=:id     - Get estimates by project
POST   /estimates                   - Create estimate
PUT    /estimates/:id               - Update estimate
DELETE /estimates/:id               - Delete estimate
POST   /estimates/:id/submit        - Submit for approval
POST   /estimates/:id/approve       - Approve estimate
POST   /estimates/:id/reject        - Reject estimate

GET    /documents                   - List all documents
GET    /documents/:id               - Get single document
GET    /documents?projectId=:id     - Get documents by project
POST   /documents                   - Upload document (multipart/form-data)
PUT    /documents/:id               - Update document
DELETE /documents/:id               - Delete document

GET    /plans                       - List all plans
GET    /plans/:id                   - Get single plan
GET    /plans?projectId=:id         - Get plans by project
POST   /plans                       - Create plan
PUT    /plans/:id                   - Update plan
DELETE /plans/:id                   - Delete plan
```

### Purchase Endpoints

```
GET    /mrs                         - List all MRs
GET    /mrs/:id                     - Get single MR
POST   /mrs                         - Create MR
PUT    /mrs/:id                     - Update MR
DELETE /mrs/:id                     - Delete MR
POST   /mrs/:id/submit              - Submit for approval
POST   /mrs/:id/approve             - Approve MR
POST   /mrs/:id/reject              - Reject MR

GET    /quotations                  - List all quotations
GET    /quotations/:id              - Get single quotation
GET    /quotations?mrId=:id         - Get quotations by MR
POST   /quotations                  - Create quotation
PUT    /quotations/:id              - Update quotation
DELETE /quotations/:id              - Delete quotation

GET    /comparative-statements      - List all CS
GET    /comparative-statements/:id  - Get single CS
POST   /comparative-statements      - Create CS
PUT    /comparative-statements/:id  - Update CS
DELETE /comparative-statements/:id  - Delete CS
POST   /comparative-statements/:id/select-supplier - Select supplier

GET    /pos                         - List all POs
GET    /pos/:id                     - Get single PO
POST   /pos                         - Create PO
PUT    /pos/:id                     - Update PO
DELETE /pos/:id                     - Delete PO
POST   /pos/:id/submit              - Submit for approval
POST   /pos/:id/approve             - Approve PO
POST   /pos/:id/reject              - Reject PO

GET    /purchase-bills              - List all bills
GET    /purchase-bills/:id          - Get single bill
GET    /purchase-bills?poId=:id     - Get bills by PO
POST   /purchase-bills              - Create bill
PUT    /purchase-bills/:id          - Update bill
DELETE /purchase-bills/:id          - Delete bill

GET    /items                       - List all items
GET    /items/:id                   - Get single item
POST   /items                       - Create item
PUT    /items/:id                   - Update item
DELETE /items/:id                   - Delete item
```

## Authentication

The API calls automatically include the authentication token from `localStorage`:

```typescript
const token = localStorage.getItem('authToken');
headers: {
  'Authorization': token ? `Bearer ${token}` : '',
}
```

Make sure your backend validates this token on protected routes.

## Error Handling

All hooks include automatic error handling with toast notifications:

```typescript
onError: (error: Error) => {
  toast.error(error.message || 'Operation failed');
}
```

## File Uploads

Document uploads use `FormData`:

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('projectId', projectId);
formData.append('name', fileName);
formData.append('type', fileType);

const createDocument = useCreateDocument();
createDocument.mutate(formData);
```

## Testing with Mock Data

By default, the app uses MSW for mock data. This allows:
- **Offline development**
- **Consistent test data**
- **Fast iteration**

Mock data is located in:
- `src/lib/msw/data/` - Mock data definitions
- `src/lib/msw/handlers/` - API response handlers

## Migration Checklist

When switching to real backend:

1. ✅ Set `VITE_USE_REAL_BACKEND=true` in `.env`
2. ✅ Configure `VITE_API_URL` to point to your backend
3. ✅ Ensure backend implements all endpoints from `BACKEND_COMPLETE_IMPLEMENTATION_GUIDE.md`
4. ✅ Run seed scripts to populate database
5. ✅ Test authentication flow
6. ✅ Verify all CRUD operations
7. ✅ Test workflow actions (submit/approve/reject)
8. ✅ Test file uploads for documents
9. ✅ Verify error handling and validation

## Component Integration Examples

### Creating a Material Requisition

```typescript
import { useCreateMR, useSubmitMR } from '@/lib/hooks/usePurchaseBackend';

function MRForm() {
  const createMR = useCreateMR();
  const submitMR = useSubmitMR();
  
  const handleSubmit = async (formData) => {
    try {
      const result = await createMR.mutateAsync(formData);
      // Optionally submit immediately
      await submitMR.mutateAsync(result.id);
    } catch (error) {
      // Error handled by hooks
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Approving an Estimate

```typescript
import { useApproveEstimate, useRejectEstimate } from '@/lib/hooks/useEngineering';

function EstimateApproval({ estimateId }) {
  const approveEstimate = useApproveEstimate();
  const rejectEstimate = useRejectEstimate();
  
  const handleApprove = () => {
    approveEstimate.mutate({ 
      id: estimateId,
      data: { comments: 'Approved' }
    });
  };
  
  const handleReject = () => {
    rejectEstimate.mutate({ 
      id: estimateId,
      data: { comments: 'Rejected' }
    });
  };
  
  return (
    <div>
      <Button onClick={handleApprove}>Approve</Button>
      <Button onClick={handleReject}>Reject</Button>
    </div>
  );
}
```

## Troubleshooting

### CORS Issues
If you get CORS errors, configure your backend:
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
```

### 401 Unauthorized
- Check if `authToken` is stored in localStorage
- Verify token is valid and not expired
- Ensure backend validates tokens correctly

### Network Errors
- Verify backend is running
- Check `VITE_API_URL` configuration
- Test endpoints with Postman/curl

### Data Not Updating
- Check React Query cache invalidation
- Verify mutation success callbacks
- Check browser console for errors

## Next Steps

1. Start your backend server (port 5000 by default)
2. Run seed scripts to populate initial data
3. Set `VITE_USE_REAL_BACKEND=true`
4. Test all module features
5. Monitor console for any API errors

For complete backend implementation details, see `BACKEND_COMPLETE_IMPLEMENTATION_GUIDE.md`.
