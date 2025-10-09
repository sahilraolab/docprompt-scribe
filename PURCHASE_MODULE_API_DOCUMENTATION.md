# Purchase Module - API Documentation

## Overview
This document provides complete API specifications for the Purchase Module backend implementation using Node.js and MongoDB.

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
All API endpoints require JWT authentication token in the header:
```
Authorization: Bearer {token}
```

---

## 1. SUPPLIERS

### 1.1 Get All Suppliers
**Endpoint:** `GET /api/suppliers`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `search` (optional): Search by name, code, contact
- `active` (optional): Filter by active status (true/false)
- `city` (optional): Filter by city
- `state` (optional): Filter by state

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "code": "SUPP001",
      "name": "ABC Suppliers Pvt Ltd",
      "contact": "John Doe",
      "phone": "9876543210",
      "email": "contact@abcsuppliers.com",
      "gst": "29ABCDE1234F1Z5",
      "pan": "ABCDE1234F",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "bankName": "HDFC Bank",
      "accountNo": "1234567890",
      "ifsc": "HDFC0001234",
      "rating": 4,
      "paymentTerms": "Net 30 days",
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "userId",
      "updatedBy": "userId"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 2
}
```

### 1.2 Get Supplier by ID
**Endpoint:** `GET /api/suppliers/:id`

**Response:** Same as single supplier object above

### 1.3 Create Supplier
**Endpoint:** `POST /api/suppliers`

**Request Body:**
```json
{
  "name": "ABC Suppliers Pvt Ltd",
  "contact": "John Doe",
  "phone": "9876543210",
  "email": "contact@abcsuppliers.com",
  "gst": "29ABCDE1234F1Z5",
  "pan": "ABCDE1234F",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "bankName": "HDFC Bank",
  "accountNo": "1234567890",
  "ifsc": "HDFC0001234",
  "rating": 4,
  "paymentTerms": "Net 30 days",
  "active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": {
    "_id": "string",
    "code": "SUPP001",
    ...
  }
}
```

### 1.4 Update Supplier
**Endpoint:** `PUT /api/suppliers/:id`

**Request Body:** Same as Create Supplier

**Response:** Same as Create Supplier

### 1.5 Delete Supplier
**Endpoint:** `DELETE /api/suppliers/:id`

**Response:**
```json
{
  "success": true,
  "message": "Supplier deleted successfully"
}
```

---

## 2. MATERIAL REQUISITIONS (MR)

### 2.1 Get All MRs
**Endpoint:** `GET /api/mrs`

**Query Parameters:**
- `page`, `limit`, `search`
- `projectId` (optional): Filter by project
- `status` (optional): Draft, Pending, Approved, Rejected
- `requestedBy` (optional): Filter by user ID
- `startDate`, `endDate` (optional): Date range filter

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "code": "MR2024-001",
      "projectId": "projectId",
      "projectName": "Metro Line 3",
      "items": [
        {
          "_id": "itemId",
          "itemId": "materialItemId",
          "itemName": "Cement - OPC 53",
          "description": "Portland Cement",
          "qty": 100,
          "uom": "Bags",
          "requiredBy": "2024-12-31"
        }
      ],
      "status": "Pending",
      "requestedBy": "userId",
      "requestedByName": "John Doe",
      "approvalStatus": "Pending",
      "approvalLevel": 1,
      "approvers": [
        {
          "userId": "userId",
          "userName": "Manager Name",
          "level": 1,
          "status": "Pending",
          "approvedAt": null,
          "remarks": ""
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 50
}
```

### 2.2 Get MR by ID
**Endpoint:** `GET /api/mrs/:id`

### 2.3 Create MR
**Endpoint:** `POST /api/mrs`

**Request Body:**
```json
{
  "projectId": "projectId",
  "items": [
    {
      "itemId": "materialItemId",
      "description": "Portland Cement",
      "qty": 100,
      "uom": "Bags",
      "requiredBy": "2024-12-31"
    }
  ],
  "status": "Draft"
}
```

### 2.4 Update MR
**Endpoint:** `PUT /api/mrs/:id`

### 2.5 Submit MR for Approval
**Endpoint:** `POST /api/mrs/:id/submit`

**Response:**
```json
{
  "success": true,
  "message": "MR submitted for approval",
  "data": {
    "_id": "mrId",
    "status": "Pending",
    "approvalStatus": "Pending"
  }
}
```

### 2.6 Approve/Reject MR
**Endpoint:** `POST /api/mrs/:id/approve`

**Request Body:**
```json
{
  "action": "approve", // or "reject"
  "remarks": "Approved for procurement"
}
```

---

## 3. QUOTATIONS

### 3.1 Get All Quotations
**Endpoint:** `GET /api/quotations`

**Query Parameters:**
- `page`, `limit`, `search`
- `supplierId` (optional)
- `mrId` (optional)
- `status` (optional): Active, Expired, Accepted, Rejected

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "code": "QT2024-001",
      "supplierId": "supplierId",
      "supplierName": "ABC Suppliers",
      "mrId": "mrId",
      "mrCode": "MR2024-001",
      "expiresAt": "2024-12-31",
      "items": [
        {
          "_id": "itemId",
          "mrItemId": "mrItemId",
          "description": "Portland Cement",
          "qty": 100,
          "uom": "Bags",
          "rate": 350,
          "taxPct": 18,
          "amount": 35000
        }
      ],
      "notes": "Delivery within 7 days",
      "status": "Active",
      "totalAmount": 35000,
      "taxAmount": 6300,
      "grandTotal": 41300,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 25
}
```

### 3.2 Get Quotation by ID
**Endpoint:** `GET /api/quotations/:id`

### 3.3 Create Quotation
**Endpoint:** `POST /api/quotations`

**Request Body:**
```json
{
  "supplierId": "supplierId",
  "mrId": "mrId",
  "expiresAt": "2024-12-31",
  "items": [
    {
      "mrItemId": "mrItemId",
      "description": "Portland Cement",
      "qty": 100,
      "uom": "Bags",
      "rate": 350,
      "taxPct": 18
    }
  ],
  "notes": "Delivery within 7 days"
}
```

### 3.4 Update Quotation
**Endpoint:** `PUT /api/quotations/:id`

### 3.5 Accept/Reject Quotation
**Endpoint:** `POST /api/quotations/:id/status`

**Request Body:**
```json
{
  "status": "Accepted", // or "Rejected"
  "remarks": "Best quote"
}
```

---

## 4. COMPARATIVE STATEMENTS

### 4.1 Get All Comparative Statements
**Endpoint:** `GET /api/comparative-statements`

**Query Parameters:**
- `page`, `limit`, `search`
- `mrId` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "code": "CS2024-001",
      "mrId": "mrId",
      "mrCode": "MR2024-001",
      "quotations": [
        {
          "quotationId": "quotationId",
          "supplierId": "supplierId",
          "supplierName": "ABC Suppliers",
          "totalAmount": 41300,
          "items": [...]
        }
      ],
      "selectedSupplierId": "supplierId",
      "selectedQuotationId": "quotationId",
      "analysis": "ABC Suppliers provides best pricing with good delivery terms",
      "comparison": {
        "lowestPrice": 41300,
        "highestPrice": 45000,
        "averagePrice": 43000
      },
      "createdBy": "userId",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 10
}
```

### 4.2 Get Comparative Statement by ID
**Endpoint:** `GET /api/comparative-statements/:id`

### 4.3 Create Comparative Statement
**Endpoint:** `POST /api/comparative-statements`

**Request Body:**
```json
{
  "mrId": "mrId",
  "quotationIds": ["quotationId1", "quotationId2"],
  "analysis": "Comparison analysis text"
}
```

### 4.4 Select Supplier
**Endpoint:** `POST /api/comparative-statements/:id/select`

**Request Body:**
```json
{
  "supplierId": "supplierId",
  "quotationId": "quotationId",
  "remarks": "Selected based on price and delivery"
}
```

---

## 5. PURCHASE ORDERS (PO)

### 5.1 Get All POs
**Endpoint:** `GET /api/pos`

**Query Parameters:**
- `page`, `limit`, `search`
- `projectId` (optional)
- `supplierId` (optional)
- `status` (optional): Draft, Pending, Approved, Rejected, Issued, Closed
- `startDate`, `endDate` (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "code": "PO2024-001",
      "supplierId": "supplierId",
      "supplierName": "ABC Suppliers",
      "projectId": "projectId",
      "projectName": "Metro Line 3",
      "items": [
        {
          "_id": "itemId",
          "description": "Portland Cement",
          "qty": 100,
          "uom": "Bags",
          "rate": 350,
          "taxPct": 18,
          "amount": 35000,
          "taxAmount": 6300,
          "totalAmount": 41300
        }
      ],
      "status": "Approved",
      "total": 35000,
      "taxTotal": 6300,
      "grandTotal": 41300,
      "deliveryDate": "2024-12-31",
      "terms": "Payment within 30 days",
      "approvalStatus": "Approved",
      "approvers": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 75
}
```

### 5.2 Get PO by ID
**Endpoint:** `GET /api/pos/:id`

### 5.3 Create PO
**Endpoint:** `POST /api/pos`

**Request Body:**
```json
{
  "supplierId": "supplierId",
  "projectId": "projectId",
  "items": [
    {
      "description": "Portland Cement",
      "qty": 100,
      "uom": "Bags",
      "rate": 350,
      "taxPct": 18
    }
  ],
  "deliveryDate": "2024-12-31",
  "terms": "Payment within 30 days"
}
```

### 5.4 Update PO
**Endpoint:** `PUT /api/pos/:id`

### 5.5 Submit PO for Approval
**Endpoint:** `POST /api/pos/:id/submit`

### 5.6 Approve/Reject PO
**Endpoint:** `POST /api/pos/:id/approve`

**Request Body:**
```json
{
  "action": "approve", // or "reject"
  "remarks": "Approved"
}
```

### 5.7 Issue PO
**Endpoint:** `POST /api/pos/:id/issue`

**Response:**
```json
{
  "success": true,
  "message": "PO issued to supplier",
  "data": {
    "_id": "poId",
    "status": "Issued",
    "issuedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5.8 Close PO
**Endpoint:** `POST /api/pos/:id/close`

---

## 6. PURCHASE BILLS

### 6.1 Get All Purchase Bills
**Endpoint:** `GET /api/purchase-bills`

**Query Parameters:**
- `page`, `limit`, `search`
- `poId` (optional)
- `supplierId` (optional)
- `status` (optional): Draft, Pending, Approved, Paid

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "code": "PB2024-001",
      "poId": "poId",
      "poCode": "PO2024-001",
      "supplierId": "supplierId",
      "supplierName": "ABC Suppliers",
      "invoiceNo": "INV-2024-001",
      "invoiceDate": "2024-01-15",
      "amount": 35000,
      "tax": 6300,
      "total": 41300,
      "status": "Pending",
      "dueDate": "2024-02-15",
      "paidAmount": 0,
      "balanceAmount": 41300,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 30
}
```

### 6.2 Get Purchase Bill by ID
**Endpoint:** `GET /api/purchase-bills/:id`

### 6.3 Create Purchase Bill
**Endpoint:** `POST /api/purchase-bills`

**Request Body:**
```json
{
  "poId": "poId",
  "invoiceNo": "INV-2024-001",
  "invoiceDate": "2024-01-15",
  "amount": 35000,
  "tax": 6300,
  "total": 41300,
  "dueDate": "2024-02-15"
}
```

### 6.4 Update Purchase Bill
**Endpoint:** `PUT /api/purchase-bills/:id`

### 6.5 Approve Purchase Bill
**Endpoint:** `POST /api/purchase-bills/:id/approve`

### 6.6 Record Payment
**Endpoint:** `POST /api/purchase-bills/:id/payment`

**Request Body:**
```json
{
  "amount": 41300,
  "paymentDate": "2024-01-20",
  "paymentMode": "Bank Transfer",
  "referenceNo": "REF123456",
  "remarks": "Payment completed"
}
```

---

## 7. MATERIAL RATES

### 7.1 Get All Material Rates
**Endpoint:** `GET /api/material-rates`

**Query Parameters:**
- `page`, `limit`, `search`
- `supplierId` (optional)
- `itemId` (optional)
- `status` (optional): Active, Inactive
- `effectiveDate` (optional): Get rates effective on a specific date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "itemId": "itemId",
      "itemName": "Cement - OPC 53",
      "itemCode": "CEM-001",
      "supplierId": "supplierId",
      "supplierName": "ABC Suppliers",
      "rate": 350,
      "uom": "Bag",
      "taxPct": 18,
      "effectiveFrom": "2024-01-01",
      "effectiveTo": "2024-12-31",
      "status": "Active",
      "minOrderQty": 100,
      "leadTimeDays": 7,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 200
}
```

### 7.2 Get Material Rate by ID
**Endpoint:** `GET /api/material-rates/:id`

### 7.3 Create Material Rate
**Endpoint:** `POST /api/material-rates`

**Request Body:**
```json
{
  "itemId": "itemId",
  "supplierId": "supplierId",
  "rate": 350,
  "uom": "Bag",
  "taxPct": 18,
  "effectiveFrom": "2024-01-01",
  "effectiveTo": "2024-12-31",
  "minOrderQty": 100,
  "leadTimeDays": 7
}
```

### 7.4 Update Material Rate
**Endpoint:** `PUT /api/material-rates/:id`

### 7.5 Deactivate Material Rate
**Endpoint:** `POST /api/material-rates/:id/deactivate`

---

## 8. DASHBOARD & REPORTS

### 8.1 Purchase Dashboard Stats
**Endpoint:** `GET /api/purchase/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingMRs": 15,
    "pendingPOs": 8,
    "pendingApprovals": 12,
    "openPOs": 25,
    "totalSpend": {
      "thisMonth": 5000000,
      "lastMonth": 4500000,
      "thisYear": 50000000
    },
    "topSuppliers": [
      {
        "supplierId": "supplierId",
        "supplierName": "ABC Suppliers",
        "totalPOs": 15,
        "totalAmount": 10000000
      }
    ],
    "recentActivity": [...]
  }
}
```

### 8.2 Purchase Reports
**Endpoint:** `GET /api/purchase/reports`

**Query Parameters:**
- `reportType`: po-summary, supplier-wise, project-wise, material-wise, pending-pos
- `startDate`, `endDate`
- `projectId` (optional)
- `supplierId` (optional)

---

## MongoDB Schema Definitions

### Supplier Schema
```javascript
{
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  gst: String,
  pan: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  bankName: String,
  accountNo: String,
  ifsc: String,
  rating: { type: Number, min: 1, max: 5 },
  paymentTerms: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: ObjectId, ref: 'User' },
  updatedBy: { type: ObjectId, ref: 'User' }
}
```

### Material Requisition Schema
```javascript
{
  code: { type: String, unique: true, required: true },
  projectId: { type: ObjectId, ref: 'Project', required: true },
  items: [{
    itemId: { type: ObjectId, ref: 'Item' },
    description: String,
    qty: Number,
    uom: String,
    requiredBy: Date
  }],
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  requestedBy: { type: ObjectId, ref: 'User', required: true },
  approvalStatus: String,
  approvalLevel: Number,
  approvers: [{
    userId: { type: ObjectId, ref: 'User' },
    level: Number,
    status: String,
    approvedAt: Date,
    remarks: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Purchase Order Schema
```javascript
{
  code: { type: String, unique: true, required: true },
  supplierId: { type: ObjectId, ref: 'Supplier', required: true },
  projectId: { type: ObjectId, ref: 'Project', required: true },
  items: [{
    description: String,
    qty: Number,
    uom: String,
    rate: Number,
    taxPct: Number,
    amount: Number
  }],
  status: { 
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Issued', 'Closed'],
    default: 'Draft'
  },
  total: Number,
  taxTotal: Number,
  grandTotal: Number,
  deliveryDate: Date,
  terms: String,
  approvalStatus: String,
  approvers: [ApproverSchema],
  issuedAt: Date,
  closedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: ObjectId, ref: 'User' }
}
```

---

## Error Handling

All API endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `DUPLICATE` - Resource already exists
- `SERVER_ERROR` - Internal server error

---

## Business Rules

1. **MR Approval**: MRs above ₹1 lakh require manager approval
2. **PO Approval**: POs above ₹10 lakh require director approval
3. **Quotation Validity**: Quotations expire after specified date
4. **Material Rates**: Only active rates can be used in quotations
5. **Purchase Bill**: Can only be created against issued POs
6. **Supplier Rating**: Automatically updated based on delivery performance

---

## Indexes Required

### Suppliers Collection
```javascript
db.suppliers.createIndex({ code: 1 }, { unique: true })
db.suppliers.createIndex({ name: "text", contact: "text" })
db.suppliers.createIndex({ active: 1 })
```

### Material Requisitions Collection
```javascript
db.materialRequisitions.createIndex({ code: 1 }, { unique: true })
db.materialRequisitions.createIndex({ projectId: 1 })
db.materialRequisitions.createIndex({ status: 1 })
db.materialRequisitions.createIndex({ createdAt: -1 })
```

### Purchase Orders Collection
```javascript
db.purchaseOrders.createIndex({ code: 1 }, { unique: true })
db.purchaseOrders.createIndex({ supplierId: 1 })
db.purchaseOrders.createIndex({ projectId: 1 })
db.purchaseOrders.createIndex({ status: 1 })
db.purchaseOrders.createIndex({ createdAt: -1 })
```

---

## Notes
- All dates are in ISO 8601 format
- All amounts are in INR (Indian Rupees)
- Pagination is zero-indexed
- Default page size is 50 items
- Maximum page size is 100 items
