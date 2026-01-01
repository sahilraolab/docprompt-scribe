# Backend API Mapping & Frontend Integration Guide

**Backend Repository:** https://github.com/sahilraolab/erp-backend  
**Stack:** Node.js + Express + Sequelize + MySQL  
**Generated:** January 2026

---

## 🚨 CRITICAL RULES

### What Frontend MUST NOT Do
1. ❌ **NO client-side calculations** - All totals, balances, taxes from backend
2. ❌ **NO MSW/Mock API** - Must call real backend endpoints
3. ❌ **NO status assumptions** - Backend controls all status transitions
4. ❌ **NO bypass of workflows** - All approvals via backend
5. ❌ **NO Supabase/Edge Functions** - Backend is Node.js + MySQL

### What Frontend MUST Do
1. ✅ Call backend APIs for ALL operations
2. ✅ Display backend-calculated values (read-only)
3. ✅ Disable actions based on status from backend
4. ✅ Handle backend rejection errors gracefully
5. ✅ Use JWT tokens from `/auth/login`

---

## 📡 API Base URL Configuration

```typescript
// src/lib/api/config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

---

## 🔐 Authentication

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh JWT token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |

---

## 👨‍💼 Admin Module

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| GET | `/admin/users` | admin.view | List users |
| POST | `/admin/users` | admin.create | Create user |
| PUT | `/admin/users/:id` | admin.update | Update user |
| GET | `/admin/roles` | admin.view | List roles |
| POST | `/admin/roles` | admin.create | Create role |

---

## 📦 Masters Module

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| **Projects** |
| GET | `/masters/projects` | masters.view | List projects |
| POST | `/masters/projects` | masters.create | Create project |
| PUT | `/masters/projects/:id` | masters.update | Update project |
| **Materials** |
| GET | `/masters/materials` | masters.view | List materials |
| POST | `/masters/materials` | masters.create | Create material |
| **Suppliers** |
| GET | `/masters/suppliers` | masters.view | List suppliers |
| POST | `/masters/suppliers` | masters.create | Create supplier |
| **Companies** |
| GET | `/masters/companies` | masters.view | List companies |
| POST | `/masters/companies` | masters.create | Create company |
| **UOMs** |
| GET | `/masters/uoms` | masters.view | List UOMs |
| POST | `/masters/uoms` | masters.create | Create UOM |
| **Departments** |
| GET | `/masters/departments` | masters.view | List departments |
| **Cost Centers** |
| GET | `/masters/cost-centers` | masters.view | List cost centers |
| **Taxes** |
| GET | `/masters/taxes` | masters.view | List tax configs |
| POST | `/masters/taxes` | masters.create | Create tax config |

---

## 🏗️ Engineering Module

### API Endpoints

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| **Budget** |
| POST | `/engineering/budget` | engineering.create | Create budget |
| PUT | `/engineering/budget/:id/approve` | engineering.approve | Approve budget |
| GET | `/engineering/budget/:projectId` | engineering.view | Get project budget |
| **Estimate** |
| POST | `/engineering/estimate` | engineering.create | Create estimate |
| POST | `/engineering/estimate/version` | engineering.update | Add new version |
| PUT | `/engineering/estimate/:id/approve` | engineering.approve | Approve estimate → FINAL |
| GET | `/engineering/estimate` | engineering.view | List estimates |
| **BBS (BOQ)** |
| POST | `/engineering/bbs` | engineering.create | Create BBS (requires FINAL estimate) |
| PUT | `/engineering/bbs/:id/approve` | engineering.approve | Approve BBS |
| GET | `/engineering/bbs` | engineering.view | List BBS items |
| **Drawings** |
| POST | `/engineering/drawings` | engineering.create | Create drawing |
| POST | `/engineering/drawings/revision` | engineering.update | Add revision |
| PUT | `/engineering/drawings/:id/approve` | engineering.approve | Approve drawing |
| **Compliance** |
| POST | `/engineering/compliance` | engineering.create | Add compliance record |

### Status Flows

```
BUDGET:     DRAFT → APPROVED → LOCKED
ESTIMATE:   DRAFT → FINAL (via approve)
BBS:        DRAFT → APPROVED → LOCKED
DRAWINGS:   DRAFT → APPROVED
```

### Backend Business Rules

1. **BBS can ONLY be created from FINAL estimate**
   ```javascript
   if (!estimate || estimate.status !== 'FINAL') {
     throw new Error('BBS can be created only from approved estimate');
   }
   ```

2. **BBS quantity consumption (called by WO/RA Bill)**
   ```javascript
   exports.consumeBBSQty = async ({ bbsId, qty }, t) => {
     // Locks row, validates, updates executedQty
     if (newExecuted > bbs.quantity) {
       throw new Error('BOQ quantity exceeded');
     }
   }
   ```

3. **Compliance blocking check**
   ```javascript
   exports.ensureComplianceClear = async (projectId, t) => {
     // Blocks RA Bills, Posting if blocking compliance exists
   }
   ```

---

## 🛒 Purchase Module

### API Endpoints

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| **Requisitions (MR)** |
| POST | `/purchase/requisitions` | purchase.create | Create MR |
| PUT | `/purchase/requisitions/:id/submit` | purchase.create | Submit MR for approval |
| **RFQ** |
| POST | `/purchase/rfqs` | purchase.create | Create RFQ from approved MR |
| **Quotations** |
| POST | `/purchase/quotations` | purchase.create | Submit supplier quotation |
| PUT | `/purchase/quotations/:id/approve` | purchase.approve | Approve quotation |
| **Purchase Orders** |
| POST | `/purchase/po` | purchase.approve | Create PO |
| **Purchase Bills** |
| POST | `/purchase/bills` | purchase.create | Create purchase bill |
| PUT | `/purchase/bills/:id/post` | purchase.approve | Post bill to accounts |

### Status Flows

```
MR:        DRAFT → SUBMITTED → APPROVED
QUOTATION: SUBMITTED → APPROVED
PO:        CREATED → APPROVED
BILL:      DRAFT → POSTED
```

---

## 📋 Contracts Module

### API Endpoints

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| **Contractors** |
| POST | `/contracts/contractors` | contracts.create | Create contractor |
| **Labour Rates** |
| POST | `/contracts/labour-rates` | contracts.create | Add labour rate |
| **Work Orders** |
| POST | `/contracts/work-orders` | contracts.create | Create WO (linked to BBS) |
| PUT | `/contracts/work-orders/:id/approve` | contracts.approve | Approve WO |
| POST | `/contracts/work-orders/revise` | contracts.update | Create WO revision |
| **RA Bills** |
| POST | `/contracts/ra-bills` | contracts.create | Create RA Bill |
| PUT | `/contracts/ra-bills/:id/approve` | contracts.approve | Approve RA Bill |
| PUT | `/contracts/ra-bills/:id/post` | contracts.approve | Post to accounts |
| **Advances** |
| POST | `/contracts/advances` | contracts.create | Create advance |
| **DC Notes** |
| POST | `/contracts/dc-notes` | contracts.create | Create debit/credit note |
| PUT | `/contracts/dc-notes/:id/post` | contracts.approve | Post DC note |

### Backend Business Rules

1. **Work Order consumes BBS quantity**
2. **RA Bill cannot exceed BBS quantity**
3. **RA Bill posting requires:**
   - Approval status
   - Compliance clear check
   - Budget availability check
   - Calls `engineering.consumeBBSQty()`

---

## 📦 Inventory Module

### API Endpoints

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| **GRN** |
| POST | `/inventory/grn` | inventory.create | Create GRN (from PO) |
| PUT | `/inventory/grn/:id/approve` | inventory.approve | Approve GRN |
| **Stock** |
| GET | `/inventory/stock` | inventory.view | Get stock levels |
| GET | `/inventory/ledger` | inventory.view | Get stock ledger |
| **Material Issue** |
| POST | `/inventory/issue` | inventory.issue | Issue material |
| **Transfer** |
| POST | `/inventory/transfer` | inventory.transfer | Transfer between sites |

### Backend Rules
- No negative stock allowed
- GRN must be linked to approved PO
- Issue requires approval

---

## 🏗️ Site Module

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/site/dpr` | Create Daily Progress Report |
| POST | `/site/wpr` | Create Weekly Progress Report |

### Backend Rules
- DPR/WPR consume BBS quantities via `engineering.consumeBBSQty()`

---

## 📊 Accounts Module

### API Endpoints

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| **Chart of Accounts** |
| POST | `/accounts/accounts` | accounts.create | Create account |
| **Vouchers** |
| POST | `/accounts/vouchers` | accounts.create | Create voucher |
| PUT | `/accounts/vouchers/:id/post` | accounts.post | Post voucher to ledger |
| **Reports** |
| GET | `/accounts/trial-balance` | accounts.report | Get trial balance |
| GET | `/accounts/reports/bs` | accounts.report | Balance Sheet |
| GET | `/accounts/reports/pl` | accounts.report | Profit & Loss |

### Backend Rules
- Reports show ONLY POSTED vouchers
- All calculations done by backend
- Posting creates ledger entries

---

## 🔍 QA/QC Module

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/qaqc/rmc-batch` | Create RMC batch test |
| POST | `/qaqc/snag` | Create snag entry |
| POST | `/qaqc/pour-card` | Create pour card |
| POST | `/qaqc/test-report` | Create test report |

---

## 📊 Dashboard & MIS

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard/summary` | Dashboard KPIs |
| GET | `/mis/kpis` | MIS KPIs |
| GET | `/mis/budget` | Budget utilization |
| GET | `/mis/procurement` | Procurement metrics |
| GET | `/analytics/trends` | Trend data |

### Important
- All calculations from backend snapshots
- NO frontend calculations
- Drill-down links to transactional lists

---

## 🔄 Workflow Module

### API Endpoints

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|
| POST | `/workflow/action` | workflow.action | Approve/Reject document |

### Request Body
```json
{
  "instanceId": "uuid",
  "action": "APPROVE|REJECT",
  "remarks": "optional"
}
```

---

## 🎯 Frontend UI Rules by Status

### Engineering

| Entity | Status | Edit | Delete | Approve |
|--------|--------|------|--------|---------|
| Budget | DRAFT | ✅ | ✅ | ✅ |
| Budget | APPROVED | ❌ | ❌ | ❌ |
| Budget | LOCKED | ❌ | ❌ | ❌ |
| Estimate | DRAFT | ✅ | ✅ | ✅ |
| Estimate | FINAL | ❌ | ❌ | ❌ |
| BBS | DRAFT | ✅ | ✅ | ✅ |
| BBS | APPROVED | ❌ View execution only | ❌ | ❌ |

### Purchase

| Entity | Status | Edit | Approve | Post |
|--------|--------|------|---------|------|
| MR | DRAFT | ✅ | - | - |
| MR | SUBMITTED | ❌ | ✅ | - |
| MR | APPROVED | ❌ | ❌ | - |
| PO | CREATED | ✅ | ✅ | - |
| PO | APPROVED | ❌ | ❌ | - |
| Bill | DRAFT | ✅ | - | ✅ |
| Bill | POSTED | ❌ | - | ❌ |

### Contracts

| Entity | Status | Edit | Approve | Post |
|--------|--------|------|---------|------|
| WO | DRAFT | ✅ | ✅ | - |
| WO | APPROVED | ❌ | ❌ | - |
| RA Bill | DRAFT | ✅ | ✅ | - |
| RA Bill | APPROVED | ❌ | ❌ | ✅ |
| RA Bill | POSTED | ❌ | ❌ | ❌ |

---

## 🔧 Frontend Changes Required

### Phase 1: Infrastructure
1. Remove MSW completely
2. Create new API client for Node.js backend
3. Add JWT token management
4. Update environment variables

### Phase 2: Engineering Module
1. Estimate form - version management UI
2. BBS creation - only from FINAL estimate
3. BBS view - execution qty is READ-ONLY
4. Compliance list - show blocking status
5. Status-based button disabling

### Phase 3: Purchase Module
1. Remove client-side total calculations
2. MR submit workflow
3. PO from approved quotation only
4. Bill posting workflow

### Phase 4: Contracts Module
1. WO linked to BBS items
2. RA Bill quantity validation (backend)
3. Post to accounts workflow
4. Error handling for quantity exceeded

### Phase 5: Site/Inventory Module
1. GRN from approved PO
2. Stock from backend only
3. Issue approval workflow
4. Transfer receive workflow

### Phase 6: Accounts Module
1. Reports are READ-ONLY views
2. No client-side balance calculations
3. Only POSTED data in reports
4. Voucher posting workflow

### Phase 7: Dashboard
1. Use backend snapshot APIs
2. Remove all client-side KPI calculations
3. Drill-down to transactional lists

---

## 📋 Files to Delete/Disable

```
src/lib/msw/              # DELETE entire folder
src/main.tsx              # Remove MSW initialization
```

---

## 📋 Files to Create

```
src/lib/api/config.ts           # API configuration
src/lib/api/httpClient.ts       # Axios/fetch wrapper with JWT
src/lib/api/authClient.ts       # Authentication API
src/lib/api/engineeringClient.ts
src/lib/api/purchaseClient.ts
src/lib/api/contractsClient.ts
src/lib/api/inventoryClient.ts
src/lib/api/accountsClient.ts
src/lib/api/dashboardClient.ts
src/lib/api/workflowClient.ts
```

---

*This document is the SINGLE SOURCE OF TRUTH for frontend-backend integration.*
