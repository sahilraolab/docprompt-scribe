# Purchase Module - Backend Action Plan

**What You Need to Build to Make Purchase Module Work**

Based on your existing backend implementation (BACKEND_IMPLEMENTATION_GUIDE.md), here's what's missing and what needs to be built.

---

## ✅ What You Already Have

From your existing backend docs, you've already implemented:

1. **Authentication System** ✅
   - User login/registration
   - JWT authentication
   - Role-based access control

2. **User & Role Management** ✅
   - Users model
   - UserRoles model
   - Permission system

3. **Suppliers Module** ✅
   - Supplier CRUD operations
   - `/api/purchase/suppliers` endpoints

4. **Material Requisitions (MR)** ✅
   - MR model with items
   - Full CRUD + approval workflow
   - `/api/purchase/mr` endpoints

5. **Supporting Models** ✅
   - Projects model
   - Items model

---

## ❌ What's Missing for Purchase Module

### Priority 1: Critical for Purchase Flow

#### 1. **Quotations API** (MISSING)
**What it does**: Stores supplier quotes received against MRs

**Files to create**:
```
controllers/quotationController.js
routes/quotationRoutes.js
models/Quotation.js (if not in BACKEND_IMPLEMENTATION_GUIDE.md)
```

**Required endpoints**:
```javascript
GET    /api/purchase/quotations              // List all quotations
GET    /api/purchase/quotations/:id          // Get single quotation
GET    /api/purchase/quotations/by-mr/:mrId  // Get quotes for specific MR
POST   /api/purchase/quotations              // Create new quotation
PUT    /api/purchase/quotations/:id          // Update quotation
DELETE /api/purchase/quotations/:id          // Delete quotation
```

**Quotation Model** (MongoDB Schema):
```javascript
const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  mrItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequisition.items'
  },
  description: String,
  qty: Number,
  uom: String,
  rate: Number,
  taxPct: { type: Number, default: 18 },
  amount: Number  // qty * rate
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequisition',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  quotationNo: String,
  quotationDate: Date,
  validUntil: Date,
  paymentTerms: String,
  deliveryTerms: String,
  remarks: String,
  items: [quoteItemSchema],
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected'],
    default: 'Draft'
  },
  subtotal: Number,
  taxTotal: Number,
  grandTotal: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quotation', quotationSchema);
```

---

#### 2. **Comparative Statements API** (MISSING)
**What it does**: Compares multiple quotations to select best supplier

**Files to create**:
```
controllers/comparativeStatementController.js
routes/comparativeStatementRoutes.js
models/ComparativeStatement.js
```

**Required endpoints**:
```javascript
GET    /api/purchase/comparative              // List all CSs
GET    /api/purchase/comparative/:id          // Get CS details
POST   /api/purchase/comparative              // Create CS
PUT    /api/purchase/comparative/:id          // Update CS
POST   /api/purchase/comparative/:id/select-supplier  // Select winner
```

**ComparativeStatement Model**:
```javascript
const mongoose = require('mongoose');

const comparativeStatementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequisition',
    required: true
  },
  quotationIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  }],
  selectedSupplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  analysis: String,
  recommendations: String,
  comparisonData: mongoose.Schema.Types.Mixed, // JSON comparison matrix
  status: {
    type: String,
    enum: ['Draft', 'Under Review', 'Approved', 'Completed'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate CS code
comparativeStatementSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  
  try {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      code: new RegExp(`^CS-${year}-`)
    });
    this.code = `CS-${year}-${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('ComparativeStatement', comparativeStatementSchema);
```

---

#### 3. **Purchase Orders API** (MISSING)
**What it does**: Creates and manages purchase orders sent to suppliers

**Files to create**:
```
controllers/purchaseOrderController.js
routes/purchaseOrderRoutes.js
models/PurchaseOrder.js
```

**Required endpoints**:
```javascript
GET    /api/purchase/po                       // List all POs
GET    /api/purchase/po/:id                   // Get PO details
POST   /api/purchase/po                       // Create PO
PUT    /api/purchase/po/:id                   // Update PO
POST   /api/purchase/po/:id/submit            // Submit for approval
POST   /api/purchase/po/:id/approve           // Approve PO
POST   /api/purchase/po/:id/issue             // Issue to supplier
POST   /api/purchase/po/:id/cancel            // Cancel PO
```

**PurchaseOrder Model**:
```javascript
const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  description: String,
  qty: Number,
  uom: String,
  rate: Number,
  taxPct: { type: Number, default: 18 },
  amount: Number,
  receivedQty: { type: Number, default: 0 }
}, { _id: true });

const purchaseOrderSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequisition'
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  },
  poDate: {
    type: Date,
    required: true
  },
  deliveryDate: Date,
  deliveryAddress: String,
  paymentTerms: String,
  deliveryTerms: String,
  remarks: String,
  items: [poItemSchema],
  subtotal: Number,
  taxTotal: Number,
  grandTotal: Number,
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Issued', 'Partially Received', 'Fully Received', 'Cancelled'],
    default: 'Draft'
  },
  approvalStatus: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  issuedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate PO code
purchaseOrderSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  
  try {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      code: new RegExp(`^PO-${year}-`)
    });
    this.code = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
```

---

#### 4. **Purchase Bills API** (MISSING)
**What it does**: Manages supplier invoices/bills against POs

**Files to create**:
```
controllers/purchaseBillController.js
routes/purchaseBillRoutes.js
models/PurchaseBill.js
```

**Required endpoints**:
```javascript
GET    /api/purchase/bills                    // List all bills
GET    /api/purchase/bills/:id                // Get bill details
POST   /api/purchase/bills                    // Create bill
PUT    /api/purchase/bills/:id                // Update bill
POST   /api/purchase/bills/:id/verify         // Verify bill
POST   /api/purchase/bills/:id/approve        // Approve bill
POST   /api/purchase/bills/:id/pay            // Record payment
```

**PurchaseBill Model**:
```javascript
const mongoose = require('mongoose');

const purchaseBillSchema = new mongoose.Schema({
  poId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true
  },
  invoiceNo: {
    type: String,
    required: true
  },
  invoiceDate: {
    type: Date,
    required: true
  },
  billDate: {
    type: Date,
    required: true
  },
  dueDate: Date,
  amount: Number,
  tax: Number,
  total: Number,
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Approved', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
    default: 'Unpaid'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remarks: String,
  attachments: [String],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseBill', purchaseBillSchema);
```

---

### Priority 2: Optional but Recommended

#### 5. **Material Rates API** (OPTIONAL)
**What it does**: Maintains historical rates for materials from different suppliers

**Files to create**:
```
controllers/materialRateController.js
routes/materialRateRoutes.js
models/MaterialRate.js
```

**Required endpoints**:
```javascript
GET    /api/purchase/rates                    // List rates
GET    /api/purchase/rates/by-item/:itemId    // Get rates for item
POST   /api/purchase/rates                    // Create rate
PUT    /api/purchase/rates/:id                // Update rate
```

---

## 📊 Seed Data Requirements

You need basic seed data for these modules to serve data to Purchase:

### 1. Projects Seed Data ✅ (Already in your backend)
```javascript
// You already have this from BACKEND_MODELS_PROJECT_ITEM.md
// Just ensure at least 2-3 active projects exist
```

### 2. Items Seed Data ✅ (Already in your backend)
```javascript
// You already have this from BACKEND_MODELS_PROJECT_ITEM.md
// Ensure items cover common categories: cement, steel, sand, etc.
```

### 3. Suppliers Seed Data ✅ (Already implemented)
```javascript
// Should have 5-10 test suppliers
// Can use script from BACKEND_IMPLEMENTATION_GUIDE.md
```

### 4. New Seed Data Needed

#### Sample MRs (for testing quotations and POs)
```javascript
// scripts/seedMRs.js
const MR = require('../models/MaterialRequisition');

const sampleMRs = [
  {
    code: 'MR-2025-0001',
    projectId: '<project-id>',
    projectName: 'Skyline Tower',
    requestedBy: '<user-id>',
    requestedByName: 'John Doe',
    status: 'Approved',
    items: [
      {
        itemId: '<item-id>',
        description: 'OPC 53 Grade Cement',
        qty: 500,
        uom: 'BAG',
        requiredBy: new Date('2025-02-15')
      },
      {
        itemId: '<item-id-2>',
        description: 'TMT Steel Bars 12mm',
        qty: 2000,
        uom: 'KG',
        requiredBy: new Date('2025-02-20')
      }
    ],
    remarks: 'Urgent requirement for foundation work',
    createdBy: '<user-id>',
    createdAt: new Date('2025-01-10')
  },
  {
    code: 'MR-2025-0002',
    projectId: '<project-id>',
    projectName: 'Green Valley Apartments',
    requestedBy: '<user-id>',
    requestedByName: 'Jane Smith',
    status: 'Pending',
    items: [
      {
        itemId: '<item-id>',
        description: 'River Sand',
        qty: 10,
        uom: 'CUM',
        requiredBy: new Date('2025-02-25')
      }
    ],
    remarks: 'For plastering work',
    createdBy: '<user-id>',
    createdAt: new Date('2025-01-15')
  }
];
```

#### Sample Quotations (for testing comparative statements)
```javascript
// scripts/seedQuotations.js
const Quotation = require('../models/Quotation');

const sampleQuotations = [
  {
    mrId: '<mr-id>',
    supplierId: '<supplier-1-id>',
    quotationNo: 'Q-2025-001',
    quotationDate: new Date('2025-01-12'),
    validUntil: new Date('2025-02-12'),
    status: 'Submitted',
    items: [
      {
        description: 'OPC 53 Grade Cement',
        qty: 500,
        uom: 'BAG',
        rate: 380,
        taxPct: 18,
        amount: 190000
      },
      {
        description: 'TMT Steel Bars 12mm',
        qty: 2000,
        uom: 'KG',
        rate: 55,
        taxPct: 18,
        amount: 110000
      }
    ],
    subtotal: 300000,
    taxTotal: 54000,
    grandTotal: 354000,
    createdBy: '<user-id>'
  },
  {
    mrId: '<same-mr-id>',
    supplierId: '<supplier-2-id>',
    quotationNo: 'Q-2025-002',
    quotationDate: new Date('2025-01-13'),
    validUntil: new Date('2025-02-13'),
    status: 'Submitted',
    items: [
      {
        description: 'OPC 53 Grade Cement',
        qty: 500,
        uom: 'BAG',
        rate: 375,  // Lower price
        taxPct: 18,
        amount: 187500
      },
      {
        description: 'TMT Steel Bars 12mm',
        qty: 2000,
        uom: 'KG',
        rate: 57,  // Higher price
        taxPct: 18,
        amount: 114000
      }
    ],
    subtotal: 301500,
    taxTotal: 54270,
    grandTotal: 355770,
    createdBy: '<user-id>'
  }
];
```

---

## 🛠️ Implementation Steps

### Step 1: Create Models
```bash
# Create all 4 new models
touch models/Quotation.js
touch models/ComparativeStatement.js
touch models/PurchaseOrder.js
touch models/PurchaseBill.js
```
Copy model schemas from above sections.

### Step 2: Create Controllers
```bash
# Create all 4 controllers
touch controllers/quotationController.js
touch controllers/comparativeStatementController.js
touch controllers/purchaseOrderController.js
touch controllers/purchaseBillController.js
```
Implement CRUD operations following pattern from your existing `supplierController.js`.

### Step 3: Create Routes
```bash
# Create route files
touch routes/quotationRoutes.js
touch routes/comparativeStatementRoutes.js
touch routes/purchaseOrderRoutes.js
touch routes/purchaseBillRoutes.js
```

### Step 4: Register Routes in server.js
```javascript
// Add to server.js
const quotationRoutes = require('./routes/quotationRoutes');
const comparativeStatementRoutes = require('./routes/comparativeStatementRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const purchaseBillRoutes = require('./routes/purchaseBillRoutes');

app.use('/api/purchase/quotations', quotationRoutes);
app.use('/api/purchase/comparative', comparativeStatementRoutes);
app.use('/api/purchase/po', purchaseOrderRoutes);
app.use('/api/purchase/bills', purchaseBillRoutes);
```

### Step 5: Create Seed Data Scripts
```bash
mkdir -p scripts/seeds
touch scripts/seeds/seedMRs.js
touch scripts/seeds/seedQuotations.js
touch scripts/seeds/seedAll.js  # Master seed script
```

### Step 6: Test Each Module
1. Test Quotations API with Postman/Insomnia
2. Test Comparative Statements API
3. Test Purchase Orders API
4. Test Purchase Bills API

---

## 📋 Complete API Endpoint Checklist

### Material Requisitions ✅ (Already Done)
- [x] GET /api/purchase/mr
- [x] GET /api/purchase/mr/:id
- [x] POST /api/purchase/mr
- [x] PUT /api/purchase/mr/:id
- [x] POST /api/purchase/mr/:id/approve

### Quotations ❌ (TO DO)
- [ ] GET /api/purchase/quotations
- [ ] GET /api/purchase/quotations/:id
- [ ] GET /api/purchase/quotations/by-mr/:mrId
- [ ] POST /api/purchase/quotations
- [ ] PUT /api/purchase/quotations/:id
- [ ] DELETE /api/purchase/quotations/:id

### Comparative Statements ❌ (TO DO)
- [ ] GET /api/purchase/comparative
- [ ] GET /api/purchase/comparative/:id
- [ ] POST /api/purchase/comparative
- [ ] PUT /api/purchase/comparative/:id
- [ ] POST /api/purchase/comparative/:id/select-supplier

### Purchase Orders ❌ (TO DO)
- [ ] GET /api/purchase/po
- [ ] GET /api/purchase/po/:id
- [ ] POST /api/purchase/po
- [ ] PUT /api/purchase/po/:id
- [ ] POST /api/purchase/po/:id/submit
- [ ] POST /api/purchase/po/:id/approve
- [ ] POST /api/purchase/po/:id/issue
- [ ] POST /api/purchase/po/:id/cancel

### Purchase Bills ❌ (TO DO)
- [ ] GET /api/purchase/bills
- [ ] GET /api/purchase/bills/:id
- [ ] POST /api/purchase/bills
- [ ] PUT /api/purchase/bills/:id
- [ ] POST /api/purchase/bills/:id/verify
- [ ] POST /api/purchase/bills/:id/approve
- [ ] POST /api/purchase/bills/:id/pay

### Suppliers ✅ (Already Done)
- [x] GET /api/purchase/suppliers
- [x] GET /api/purchase/suppliers/:id
- [x] POST /api/purchase/suppliers
- [x] PUT /api/purchase/suppliers/:id
- [x] DELETE /api/purchase/suppliers/:id

### Material Rates ⚠️ (Optional)
- [ ] GET /api/purchase/rates
- [ ] GET /api/purchase/rates/by-item/:itemId
- [ ] POST /api/purchase/rates
- [ ] PUT /api/purchase/rates/:id

---

## 🎯 Summary

**What you have**: Auth, Users, Suppliers, MRs, Projects, Items ✅

**What you need to build**: 
1. **Quotations API** (Priority 1)
2. **Comparative Statements API** (Priority 1)
3. **Purchase Orders API** (Priority 1)
4. **Purchase Bills API** (Priority 1)
5. **Material Rates API** (Optional)

**Dependencies**: Projects and Items APIs should already work for read operations. If not, just ensure their GET endpoints work.

**Estimated time**: 
- 4-6 hours for Priority 1 items (with models, controllers, routes)
- 1-2 hours for seed data
- 1 hour for testing

**Total**: ~8 hours to make Purchase Module fully functional
