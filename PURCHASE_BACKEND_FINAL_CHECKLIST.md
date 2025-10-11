# Purchase Module - Backend Final Checklist

## Overview
This document outlines the final backend requirements and configuration needed for the Purchase Module to be fully operational.

---

## ✅ Already Configured Routes (Confirmed in server.js)

```javascript
// Your current server.js configuration
app.use('/api/purchase/quotations', quotationRoutes);
app.use('/api/purchase/comparative', comparativeStatementRoutes);
app.use('/api/purchase/po', purchaseOrderRoutes);
app.use('/api/purchase/bills', purchaseBillRoutes);
app.use('/api/purchase/suppliers', supplierRoutes);
app.use('/api/purchase/mrs', mrRoutes);
app.use('/api/purchase/pos', poRoutes);
app.use('/api/purchase/material-rates', materialRateRoutes);
```

---

## 🔍 Backend Requirements Verification

### 1. MongoDB Models Required

Ensure you have the following Mongoose models defined in your `/models` directory:

#### ✅ Required Models:

```javascript
// models/Supplier.js
- code (String, unique, auto-generated)
- name (String, required)
- contact (String)
- phone (String)
- email (String)
- gst (String)
- pan (String)
- address (String)
- city (String)
- state (String)
- pincode (String)
- bankName (String)
- accountNo (String)
- ifsc (String)
- rating (Number, 1-5)
- paymentTerms (String)
- active (Boolean, default: true)
- createdBy, updatedBy, createdAt, updatedAt

// models/MR.js (Material Requisition)
- code (String, unique, auto-generated)
- projectId (ObjectId, ref: 'Project')
- items (Array of embedded documents):
  - itemId (ObjectId, ref: 'Item')
  - description (String)
  - qty (Number)
  - uom (String)
  - requiredBy (Date)
- status (enum: Draft, Pending, Approved, Rejected)
- requestedBy (ObjectId, ref: 'User')
- approvalStatus, approvers (Array)
- createdBy, updatedBy, createdAt, updatedAt

// models/Quotation.js
- code (String, unique, auto-generated)
- supplierId (ObjectId, ref: 'Supplier')
- mrId (ObjectId, ref: 'MR')
- expiresAt (Date)
- items (Array):
  - mrItemId (ObjectId)
  - description (String)
  - qty (Number)
  - uom (String)
  - rate (Number)
  - taxPct (Number)
  - amount (Number, calculated)
- notes (String)
- status (enum: Active, Expired, Accepted, Rejected)
- totalAmount, taxAmount, grandTotal (Numbers, calculated)
- createdBy, updatedBy, createdAt, updatedAt

// models/ComparativeStatement.js
- code (String, unique, auto-generated)
- mrId (ObjectId, ref: 'MR')
- quotations (Array of ObjectIds, ref: 'Quotation')
- selectedSupplierId (ObjectId, ref: 'Supplier')
- selectedQuotationId (ObjectId, ref: 'Quotation')
- analysis (String)
- comparison (Object with pricing analysis)
- createdBy, createdAt, updatedAt

// models/PO.js (Purchase Order)
- code (String, unique, auto-generated, format: PO-YYYY-####)
- supplierId (ObjectId, ref: 'Supplier')
- projectId (ObjectId, ref: 'Project')
- items (Array):
  - description (String)
  - qty (Number)
  - uom (String)
  - rate (Number)
  - taxPct (Number)
  - amount (Number)
- status (enum: Draft, Pending, Approved, Rejected, Issued, Closed)
- total, taxTotal, grandTotal (Numbers)
- deliveryDate (Date)
- terms (String)
- approvalStatus, approvers (Array)
- createdBy, updatedBy, createdAt, updatedAt

// models/PurchaseBill.js
- poId (ObjectId, ref: 'PO')
- invoiceNo (String, required)
- invoiceDate (Date, required)
- amount (Number)
- tax (Number)
- total (Number)
- status (enum: Draft, Pending, Approved, Paid)
- createdBy, updatedBy, createdAt, updatedAt

// models/MaterialRate.js
- itemId (ObjectId, ref: 'Item')
- supplierId (ObjectId, ref: 'Supplier')
- rate (Number, required)
- uom (String)
- effectiveFrom (Date)
- effectiveTo (Date)
- status (enum: Active, Inactive)
- createdBy, updatedBy, createdAt, updatedAt
```

---

### 2. Controllers Required

Ensure you have controller files in your `/controllers` directory:

- `supplierController.js` - CRUD operations for suppliers
- `mrController.js` - CRUD + approval operations for MRs
- `quotationController.js` - CRUD operations for quotations
- `comparativeStatementController.js` - CRUD + supplier selection
- `poController.js` - CRUD + approval + issue operations
- `purchaseBillController.js` - CRUD operations for bills
- `materialRateController.js` - CRUD operations for rates

---

### 3. Routes Required

Ensure you have route files in your `/routes` directory:

- `suppliers.js` or `supplierRoutes.js`
- `mrs.js` or `mrRoutes.js`
- `quotationRoutes.js`
- `comparativeStatementRoutes.js`
- `pos.js` or `poRoutes.js`
- `purchaseOrderRoutes.js`
- `purchaseBillRoutes.js`
- `materialRates.js` or `materialRateRoutes.js`

---

### 4. Middleware Required

Ensure you have:

- `middleware/auth.js` - JWT authentication middleware (exports `protect`)
- `middleware/errorHandler.js` - Global error handling

---

## 📝 Backend Endpoint Verification

### Test Each Endpoint:

Use Postman or similar tool to test:

1. **Suppliers**
   - [ ] GET `/api/purchase/suppliers` - List all
   - [ ] GET `/api/purchase/suppliers/:id` - Get one
   - [ ] POST `/api/purchase/suppliers` - Create
   - [ ] PUT `/api/purchase/suppliers/:id` - Update
   - [ ] DELETE `/api/purchase/suppliers/:id` - Delete

2. **Material Requisitions**
   - [ ] GET `/api/purchase/mrs` - List all
   - [ ] GET `/api/purchase/mrs/:id` - Get one
   - [ ] POST `/api/purchase/mrs` - Create
   - [ ] PUT `/api/purchase/mrs/:id` - Update
   - [ ] POST `/api/purchase/mrs/:id/submit` - Submit
   - [ ] POST `/api/purchase/mrs/:id/approve` - Approve
   - [ ] POST `/api/purchase/mrs/:id/reject` - Reject
   - [ ] DELETE `/api/purchase/mrs/:id` - Delete

3. **Quotations**
   - [ ] GET `/api/purchase/quotations` - List all
   - [ ] GET `/api/purchase/quotations?mrId=xxx` - Filter by MR
   - [ ] GET `/api/purchase/quotations/:id` - Get one
   - [ ] POST `/api/purchase/quotations` - Create
   - [ ] PUT `/api/purchase/quotations/:id` - Update
   - [ ] DELETE `/api/purchase/quotations/:id` - Delete

4. **Comparative Statements**
   - [ ] GET `/api/purchase/comparative` - List all
   - [ ] GET `/api/purchase/comparative/:id` - Get one
   - [ ] POST `/api/purchase/comparative` - Create
   - [ ] PUT `/api/purchase/comparative/:id` - Update
   - [ ] POST `/api/purchase/comparative/:id/select-supplier` - Select
   - [ ] DELETE `/api/purchase/comparative/:id` - Delete

5. **Purchase Orders**
   - [ ] GET `/api/purchase/po` - List all
   - [ ] GET `/api/purchase/po/:id` - Get one
   - [ ] POST `/api/purchase/po` - Create
   - [ ] PUT `/api/purchase/po/:id` - Update
   - [ ] POST `/api/purchase/po/:id/submit` - Submit
   - [ ] POST `/api/purchase/po/:id/approve` - Approve
   - [ ] POST `/api/purchase/po/:id/reject` - Reject
   - [ ] DELETE `/api/purchase/po/:id` - Delete

6. **Purchase Bills**
   - [ ] GET `/api/purchase/bills` - List all
   - [ ] GET `/api/purchase/bills?poId=xxx` - Filter by PO
   - [ ] GET `/api/purchase/bills/:id` - Get one
   - [ ] POST `/api/purchase/bills` - Create
   - [ ] PUT `/api/purchase/bills/:id` - Update
   - [ ] DELETE `/api/purchase/bills/:id` - Delete

7. **Material Rates**
   - [ ] GET `/api/purchase/material-rates` - List all
   - [ ] GET `/api/purchase/material-rates/:id` - Get one
   - [ ] POST `/api/purchase/material-rates` - Create
   - [ ] PUT `/api/purchase/material-rates/:id` - Update
   - [ ] DELETE `/api/purchase/material-rates/:id` - Delete

---

## 🔧 Critical Backend Features

### 1. Auto-Generation of Codes

Implement auto-increment or unique code generation for:
- Supplier codes: `SUPP001`, `SUPP002`, etc.
- MR codes: `MR-2025-0001`, etc.
- Quotation codes: `QT-2025-0001`, etc.
- PO codes: `PO-2025-0001`, etc.
- CS codes: `CS-2025-0001`, etc.

### 2. Validation Rules

Implement server-side validation:
- Required fields validation
- Email format validation
- Phone number format
- GST/PAN format (Indian)
- Date validations (delivery date > today)
- Amount validations (positive numbers)

### 3. Calculations

Implement automatic calculations:
- **Quotations**: `amount = qty * rate`, `taxAmount = amount * taxPct / 100`, `grandTotal = amount + taxAmount`
- **Purchase Orders**: Same as quotations
- **Purchase Bills**: Sum of all items with taxes

### 4. Approval Workflows

Implement multi-level approval for:
- Material Requisitions
- Purchase Orders

Required fields:
- `approvalStatus`: Pending, Approved, Rejected
- `approvers` array with user, level, status, remarks, approvedAt

### 5. Status Transitions

Implement proper status flow:
- MR: Draft → Pending → Approved/Rejected
- PO: Draft → Pending → Approved → Issued → Closed/Rejected
- Quotation: Active → Accepted/Expired/Rejected

---

## 🗄️ Database Indexes

Add indexes for better performance:

```javascript
// Supplier
Supplier.index({ code: 1 }, { unique: true });
Supplier.index({ name: 'text' });
Supplier.index({ active: 1 });

// MR
MR.index({ code: 1 }, { unique: true });
MR.index({ projectId: 1 });
MR.index({ status: 1 });
MR.index({ requestedBy: 1 });

// Quotation
Quotation.index({ code: 1 }, { unique: true });
Quotation.index({ supplierId: 1 });
Quotation.index({ mrId: 1 });
Quotation.index({ status: 1 });

// PO
PO.index({ code: 1 }, { unique: true });
PO.index({ projectId: 1 });
PO.index({ supplierId: 1 });
PO.index({ status: 1 });

// PurchaseBill
PurchaseBill.index({ poId: 1 });
PurchaseBill.index({ invoiceNo: 1 });

// MaterialRate
MaterialRate.index({ itemId: 1, supplierId: 1 });
MaterialRate.index({ status: 1, effectiveFrom: 1 });
```

---

## 🔐 Security Checklist

- [ ] All routes protected with `protect` middleware
- [ ] Input validation on all POST/PUT requests
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize inputs)
- [ ] Rate limiting on API endpoints
- [ ] CORS properly configured
- [ ] Environment variables for sensitive data
- [ ] Proper error messages (don't expose internal details)

---

## 🚀 Deployment Checklist

### Before Deploying:

1. **Environment Variables**
   ```
   PORT=5005
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=https://your-frontend-domain.com
   ```

2. **MongoDB Setup**
   - [ ] Create production database
   - [ ] Add indexes
   - [ ] Set up backup strategy

3. **Testing**
   - [ ] Test all API endpoints
   - [ ] Test authentication flow
   - [ ] Test approval workflows
   - [ ] Test error handling
   - [ ] Load testing

4. **Monitoring**
   - [ ] Set up error logging
   - [ ] Set up performance monitoring
   - [ ] Set up database monitoring

---

## 📊 API Response Format

Ensure consistent response format:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (only in development)"
}
```

### List Response:
```json
{
  "success": true,
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "pages": 10
}
```

---

## ✅ Final Verification

Once all backend endpoints are implemented and tested:

1. [ ] Update `PURCHASE_MODULE_STATUS.md` with test results
2. [ ] Document any API changes in `PURCHASE_MODULE_API_DOCUMENTATION.md`
3. [ ] Perform end-to-end testing with frontend
4. [ ] Review security measures
5. [ ] Optimize database queries
6. [ ] Deploy to production

---

**Status**: Ready for Backend Implementation Review  
**Next Action**: Verify all backend endpoints are working correctly
