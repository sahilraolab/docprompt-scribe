# Complete Backend Implementation Guide
## Engineering + Purchase Modules

This document provides everything you need to build the backend for both Engineering and Purchase modules to make them fully functional.

---

## 📊 Current Backend Status

### ✅ Already Implemented (from BACKEND_IMPLEMENTATION_GUIDE.md)

1. **Authentication System** ✅
   - User login/registration with JWT
   - Role-based access control (RBAC)
   - `/api/auth/*` endpoints

2. **User & Role Management** ✅
   - Users model
   - UserRoles model with enum support
   - Permission system with RLS

3. **Suppliers Module** ✅
   - Full CRUD operations
   - `/api/purchase/suppliers` endpoints

4. **Material Requisitions (MR)** ✅
   - MR model with items array
   - Full CRUD + approval workflow
   - `/api/purchase/mr` endpoints

---

## 🎯 What You Need to Build

### ENGINEERING MODULE (Priority 1)

#### 1. Projects API
**Status**: ⚠️ Model exists, API endpoints needed

**Model** (from BACKEND_MODELS_PROJECT_ITEM.md):
```javascript
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  budget: {
    type: Number,
    required: true,
    default: 0
  },
  spent: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  reraId: String,
  description: String,
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

// Auto-generate project code
projectSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  
  try {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      code: new RegExp(`^PRJ-${year}-`)
    });
    this.code = `PRJ-${year}-${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Project', projectSchema);
```

**Required Endpoints**:
```javascript
// controllers/projectController.js

GET    /api/engineering/projects              // List all projects
GET    /api/engineering/projects/:id          // Get project details
POST   /api/engineering/projects              // Create project
PUT    /api/engineering/projects/:id          // Update project
DELETE /api/engineering/projects/:id          // Delete project (soft delete)
GET    /api/engineering/projects/:id/stats    // Get project statistics
```

---

#### 2. Estimates API
**Status**: ❌ Needs full implementation

**Model**:
```javascript
const mongoose = require('mongoose');

const estimateItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Material', 'Labour', 'Equipment', 'Overhead'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  uom: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, { _id: true });

const estimateSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  items: [estimateItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  description: String,
  // Approval workflow
  submittedAt: Date,
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalComments: String,
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

// Calculate totals before saving
estimateSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.total = this.subtotal + this.tax;
  }
  next();
});

module.exports = mongoose.model('Estimate', estimateSchema);
```

**Required Endpoints**:
```javascript
GET    /api/engineering/estimates                    // List all estimates
GET    /api/engineering/estimates/:id                // Get estimate details
GET    /api/engineering/estimates/by-project/:projectId  // Get project estimates
POST   /api/engineering/estimates                    // Create estimate
PUT    /api/engineering/estimates/:id                // Update estimate
DELETE /api/engineering/estimates/:id                // Delete estimate
POST   /api/engineering/estimates/:id/submit         // Submit for approval
POST   /api/engineering/estimates/:id/approve        // Approve estimate
POST   /api/engineering/estimates/:id/reject         // Reject estimate
```

---

#### 3. Documents API
**Status**: ❌ Needs full implementation

**Model**:
```javascript
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Plan', 'Permit', 'Report', 'Drawing', 'Other'],
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  url: {
    type: String,
    required: true
  },
  size: Number, // in bytes
  mimeType: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  description: String,
  isLatest: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
documentSchema.index({ projectId: 1, type: 1 });
documentSchema.index({ projectId: 1, isLatest: 1 });

module.exports = mongoose.model('Document', documentSchema);
```

**Required Endpoints**:
```javascript
GET    /api/engineering/documents                    // List all documents
GET    /api/engineering/documents/:id                // Get document details
GET    /api/engineering/documents/by-project/:projectId  // Get project documents
POST   /api/engineering/documents                    // Upload document
PUT    /api/engineering/documents/:id                // Update document metadata
DELETE /api/engineering/documents/:id                // Delete document
GET    /api/engineering/documents/:id/download       // Download document
```

---

#### 4. Items API
**Status**: ⚠️ Model exists, API endpoints needed

**Model** (from BACKEND_MODELS_PROJECT_ITEM.md):
```javascript
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['Material', 'Equipment', 'Service', 'Other'],
    required: true
  },
  subcategory: String,
  uom: {
    type: String,
    required: true
  },
  description: String,
  specifications: String,
  hsn: String, // HSN/SAC code for GST
  minStock: {
    type: Number,
    default: 0
  },
  maxStock: Number,
  reorderLevel: Number,
  isActive: {
    type: Boolean,
    default: true
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

// Auto-generate item code
itemSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  
  try {
    const prefix = this.category.substring(0, 3).toUpperCase();
    const count = await this.constructor.countDocuments({
      category: this.category
    });
    this.code = `${prefix}-${String(count + 1).padStart(5, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Item', itemSchema);
```

**Required Endpoints**:
```javascript
GET    /api/items                     // List all items
GET    /api/items/:id                 // Get item details
GET    /api/items/by-category/:cat    // Get items by category
POST   /api/items                     // Create item
PUT    /api/items/:id                 // Update item
DELETE /api/items/:id                 // Deactivate item
```

---

### PURCHASE MODULE (Priority 2)

#### 5. Quotations API
**Status**: ❌ Needs full implementation

**Model**:
```javascript
const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  mrItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  description: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  uom: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  taxPct: {
    type: Number,
    default: 18
  },
  amount: {
    type: Number,
    required: true
  }
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true
  },
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
  expiresAt: {
    type: Date,
    required: true
  },
  items: [quoteItemSchema],
  notes: String,
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'UnderReview', 'Accepted', 'Rejected', 'Expired'],
    default: 'Draft'
  },
  subtotal: Number,
  taxTotal: Number,
  grandTotal: Number,
  attachments: [String],
  terms: String,
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

// Auto-generate quotation code
quotationSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  
  try {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      code: new RegExp(`^QT-${year}-`)
    });
    this.code = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate totals
quotationSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.taxTotal = this.items.reduce((sum, item) => sum + (item.amount * item.taxPct / 100), 0);
    this.grandTotal = this.subtotal + this.taxTotal;
  }
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);
```

**Required Endpoints**:
```javascript
GET    /api/purchase/quotations                   // List all quotations
GET    /api/purchase/quotations/:id               // Get quotation details
GET    /api/purchase/quotations/by-mr/:mrId       // Get quotes for MR
POST   /api/purchase/quotations                   // Create quotation
PUT    /api/purchase/quotations/:id               // Update quotation
DELETE /api/purchase/quotations/:id               // Delete quotation
POST   /api/purchase/quotations/:id/submit        // Submit quotation
```

---

#### 6. Comparative Statements API
**Status**: ❌ Needs full implementation

**Model**:
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
  quotations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation'
  }],
  selectedSupplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  analysis: String,
  recommendations: String,
  comparisonMatrix: mongoose.Schema.Types.Mixed, // JSON comparison data
  status: {
    type: String,
    enum: ['Draft', 'UnderReview', 'Approved', 'Completed'],
    default: 'Draft'
  },
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

**Required Endpoints**:
```javascript
GET    /api/purchase/comparative                       // List all CSs
GET    /api/purchase/comparative/:id                   // Get CS details
POST   /api/purchase/comparative                       // Create CS
PUT    /api/purchase/comparative/:id                   // Update CS
POST   /api/purchase/comparative/:id/select-supplier   // Select winner
POST   /api/purchase/comparative/:id/approve           // Approve CS
```

---

#### 7. Purchase Orders API
**Status**: ❌ Needs full implementation

**Model**:
```javascript
const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  },
  description: {
    type: String,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  uom: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  taxPct: {
    type: Number,
    default: 18
  },
  amount: {
    type: Number,
    required: true
  },
  receivedQty: {
    type: Number,
    default: 0
  }
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
  items: [poItemSchema],
  status: {
    type: String,
    enum: ['Draft', 'PendingApproval', 'Approved', 'Issued', 'PartiallyReceived', 'FullyReceived', 'Cancelled'],
    default: 'Draft'
  },
  total: Number,
  taxTotal: Number,
  grandTotal: Number,
  deliveryDate: Date,
  terms: String,
  remarks: String,
  // Approval
  submittedAt: Date,
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

// Calculate totals
purchaseOrderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.taxTotal = this.items.reduce((sum, item) => sum + (item.amount * item.taxPct / 100), 0);
    this.grandTotal = this.total + this.taxTotal;
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
```

**Required Endpoints**:
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

---

#### 8. Purchase Bills API
**Status**: ❌ Needs full implementation

**Model**:
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
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Approved', 'Paid', 'Cancelled'],
    default: 'Pending'
  },
  dueDate: Date,
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentDate: Date,
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

**Required Endpoints**:
```javascript
GET    /api/purchase/bills                    // List all bills
GET    /api/purchase/bills/:id                // Get bill details
POST   /api/purchase/bills                    // Create bill
PUT    /api/purchase/bills/:id                // Update bill
POST   /api/purchase/bills/:id/verify         // Verify bill
POST   /api/purchase/bills/:id/approve        // Approve bill
POST   /api/purchase/bills/:id/pay            // Record payment
```

---

## 📦 Seed Data Required

### 1. Projects Seed Data (Priority 1)
```javascript
// scripts/seeds/seedProjects.js
const Project = require('../../models/Project');

const seedProjects = async (userId) => {
  const projects = [
    {
      name: 'Skyline Tower',
      code: 'PRJ-2025-0001',
      city: 'Mumbai',
      state: 'Maharashtra',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2026-06-30'),
      managerId: userId,
      budget: 50000000,
      spent: 15000000,
      progress: 30,
      status: 'Active',
      reraId: 'P51800001234',
      description: 'Luxury residential tower with 25 floors',
      createdBy: userId
    },
    {
      name: 'Green Valley Apartments',
      code: 'PRJ-2025-0002',
      city: 'Pune',
      state: 'Maharashtra',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-12-31'),
      managerId: userId,
      budget: 30000000,
      spent: 8000000,
      progress: 25,
      status: 'Active',
      reraId: 'P52100005678',
      description: '3 blocks of 8 floors each',
      createdBy: userId
    },
    {
      name: 'Tech Park Phase 1',
      code: 'PRJ-2025-0003',
      city: 'Bangalore',
      state: 'Karnataka',
      startDate: new Date('2025-01-01'),
      status: 'Planning',
      managerId: userId,
      budget: 80000000,
      spent: 0,
      progress: 0,
      description: 'IT office space with modern amenities',
      createdBy: userId
    }
  ];

  await Project.deleteMany({});
  const created = await Project.insertMany(projects);
  console.log(`✅ Seeded ${created.length} projects`);
  return created;
};

module.exports = seedProjects;
```

---

### 2. Items Seed Data (Priority 1)
```javascript
// scripts/seeds/seedItems.js
const Item = require('../../models/Item');

const seedItems = async (userId) => {
  const items = [
    {
      name: 'OPC 53 Grade Cement',
      code: 'MAT-00001',
      category: 'Material',
      subcategory: 'Cement',
      uom: 'BAG',
      description: '50kg bag of OPC 53 Grade cement',
      hsn: '25231000',
      minStock: 100,
      maxStock: 1000,
      reorderLevel: 200,
      createdBy: userId
    },
    {
      name: 'TMT Steel Bars 12mm',
      code: 'MAT-00002',
      category: 'Material',
      subcategory: 'Steel',
      uom: 'KG',
      description: '12mm TMT bars for construction',
      hsn: '72142000',
      minStock: 500,
      maxStock: 5000,
      reorderLevel: 1000,
      createdBy: userId
    },
    {
      name: 'River Sand',
      code: 'MAT-00003',
      category: 'Material',
      subcategory: 'Sand',
      uom: 'CUM',
      description: 'Fine river sand for construction',
      hsn: '25051000',
      minStock: 10,
      maxStock: 100,
      reorderLevel: 20,
      createdBy: userId
    },
    {
      name: '20mm Aggregate',
      code: 'MAT-00004',
      category: 'Material',
      subcategory: 'Aggregate',
      uom: 'CUM',
      description: '20mm stone aggregate',
      hsn: '25171000',
      minStock: 10,
      maxStock: 100,
      reorderLevel: 20,
      createdBy: userId
    },
    {
      name: 'Ready Mix Concrete M25',
      code: 'MAT-00005',
      category: 'Material',
      subcategory: 'Concrete',
      uom: 'CUM',
      description: 'RMC M25 grade',
      hsn: '38160000',
      minStock: 0,
      createdBy: userId
    },
    {
      name: 'Bricks (Red Clay)',
      code: 'MAT-00006',
      category: 'Material',
      subcategory: 'Bricks',
      uom: 'NOS',
      description: 'Standard red clay bricks',
      hsn: '69041000',
      minStock: 1000,
      maxStock: 10000,
      reorderLevel: 2000,
      createdBy: userId
    },
    {
      name: 'Concrete Mixer',
      code: 'EQU-00001',
      category: 'Equipment',
      subcategory: 'Machinery',
      uom: 'NOS',
      description: 'Portable concrete mixer',
      minStock: 0,
      createdBy: userId
    },
    {
      name: 'Scaffolding Rental',
      code: 'SER-00001',
      category: 'Service',
      subcategory: 'Rental',
      uom: 'DAY',
      description: 'Scaffolding rental per day',
      createdBy: userId
    }
  ];

  await Item.deleteMany({});
  const created = await Item.insertMany(items);
  console.log(`✅ Seeded ${created.length} items`);
  return created;
};

module.exports = seedItems;
```

---

### 3. Material Requisitions Seed Data
```javascript
// scripts/seeds/seedMRs.js
const MR = require('../../models/MaterialRequisition');

const seedMRs = async (projectId, userId, items) => {
  const mrs = [
    {
      code: 'MR-2025-0001',
      projectId: projectId,
      status: 'Approved',
      requestedBy: userId,
      items: [
        {
          itemId: items[0]._id, // Cement
          description: items[0].name,
          qty: 500,
          uom: 'BAG',
          requiredBy: new Date('2025-02-15')
        },
        {
          itemId: items[1]._id, // Steel
          description: items[1].name,
          qty: 2000,
          uom: 'KG',
          requiredBy: new Date('2025-02-15')
        }
      ],
      remarks: 'Urgent requirement for foundation work',
      approvedBy: userId,
      approvedAt: new Date(),
      createdBy: userId
    },
    {
      code: 'MR-2025-0002',
      projectId: projectId,
      status: 'Pending',
      requestedBy: userId,
      items: [
        {
          itemId: items[2]._id, // Sand
          description: items[2].name,
          qty: 10,
          uom: 'CUM',
          requiredBy: new Date('2025-02-25')
        },
        {
          itemId: items[3]._id, // Aggregate
          description: items[3].name,
          qty: 15,
          uom: 'CUM',
          requiredBy: new Date('2025-02-25')
        }
      ],
      remarks: 'For plastering work',
      createdBy: userId
    }
  ];

  await MR.deleteMany({});
  const created = await MR.insertMany(mrs);
  console.log(`✅ Seeded ${created.length} MRs`);
  return created;
};

module.exports = seedMRs;
```

---

### 4. Quotations Seed Data
```javascript
// scripts/seeds/seedQuotations.js
const Quotation = require('../../models/Quotation');

const seedQuotations = async (mrId, supplierIds, userId) => {
  const quotations = [
    {
      code: 'QT-2025-0001',
      mrId: mrId,
      supplierId: supplierIds[0],
      expiresAt: new Date('2025-03-15'),
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
      notes: 'Delivery within 7 days',
      createdBy: userId
    },
    {
      code: 'QT-2025-0002',
      mrId: mrId,
      supplierId: supplierIds[1],
      expiresAt: new Date('2025-03-15'),
      status: 'Submitted',
      items: [
        {
          description: 'OPC 53 Grade Cement',
          qty: 500,
          uom: 'BAG',
          rate: 375,
          taxPct: 18,
          amount: 187500
        },
        {
          description: 'TMT Steel Bars 12mm',
          qty: 2000,
          uom: 'KG',
          rate: 57,
          taxPct: 18,
          amount: 114000
        }
      ],
      notes: 'Better quality steel, delivery within 5 days',
      createdBy: userId
    }
  ];

  await Quotation.deleteMany({});
  const created = await Quotation.insertMany(quotations);
  console.log(`✅ Seeded ${created.length} quotations`);
  return created;
};

module.exports = seedQuotations;
```

---

### 5. Master Seed Script
```javascript
// scripts/seeds/seedAll.js
const mongoose = require('mongoose');
const User = require('../../models/User');
const Supplier = require('../../models/Supplier');
const seedProjects = require('./seedProjects');
const seedItems = require('./seedItems');
const seedMRs = require('./seedMRs');
const seedQuotations = require('./seedQuotations');

const seedAll = async () => {
  try {
    console.log('🌱 Starting seed process...');

    // Get or create admin user
    let user = await User.findOne({ email: 'admin@example.com' });
    if (!user) {
      console.log('❌ Admin user not found. Please create admin user first.');
      process.exit(1);
    }

    // Seed Projects
    const projects = await seedProjects(user._id);
    
    // Seed Items
    const items = await seedItems(user._id);
    
    // Seed MRs for first project
    const mrs = await seedMRs(projects[0]._id, user._id, items);
    
    // Get suppliers (should already exist from BACKEND_IMPLEMENTATION_GUIDE.md)
    const suppliers = await Supplier.find().limit(2);
    if (suppliers.length < 2) {
      console.log('❌ Need at least 2 suppliers. Please seed suppliers first.');
      process.exit(1);
    }
    
    // Seed Quotations for first approved MR
    const approvedMR = mrs.find(mr => mr.status === 'Approved');
    if (approvedMR) {
      const supplierIds = suppliers.map(s => s._id);
      await seedQuotations(approvedMR._id, supplierIds, user._id);
    }

    console.log('✅ All seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Items: ${items.length}`);
    console.log(`   MRs: ${mrs.length}`);
    console.log(`   Suppliers: ${suppliers.length} (existing)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

// Connect to DB and run
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/erp-system')
  .then(() => {
    console.log('📦 Connected to MongoDB');
    return seedAll();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });
```

---

## 🛠️ Implementation Steps

### Phase 1: Engineering Module (Days 1-2)

#### Day 1: Projects & Items APIs
```bash
# 1. Create models (if not already done)
touch models/Project.js
touch models/Item.js

# 2. Create controllers
touch controllers/projectController.js
touch controllers/itemController.js

# 3. Create routes
touch routes/projectRoutes.js
touch routes/itemRoutes.js

# 4. Register in server.js
# Add:
# app.use('/api/engineering/projects', projectRoutes);
# app.use('/api/items', itemRoutes);

# 5. Create seed scripts
mkdir -p scripts/seeds
touch scripts/seeds/seedProjects.js
touch scripts/seeds/seedItems.js

# 6. Test endpoints
npm run seed
# Test with Postman/Insomnia
```

#### Day 2: Estimates & Documents APIs
```bash
# 1. Create models
touch models/Estimate.js
touch models/Document.js

# 2. Create controllers
touch controllers/estimateController.js
touch controllers/documentController.js

# 3. Create routes
touch routes/estimateRoutes.js
touch routes/documentRoutes.js

# 4. Register in server.js
# Add:
# app.use('/api/engineering/estimates', estimateRoutes);
# app.use('/api/engineering/documents', documentRoutes);

# 5. Test endpoints
```

---

### Phase 2: Purchase Module (Days 3-4)

#### Day 3: Quotations & Comparative Statements
```bash
# 1. Create models
touch models/Quotation.js
touch models/ComparativeStatement.js

# 2. Create controllers
touch controllers/quotationController.js
touch controllers/comparativeStatementController.js

# 3. Create routes
touch routes/quotationRoutes.js
touch routes/comparativeStatementRoutes.js

# 4. Register in server.js
# app.use('/api/purchase/quotations', quotationRoutes);
# app.use('/api/purchase/comparative', comparativeStatementRoutes);

# 5. Create seed scripts
touch scripts/seeds/seedQuotations.js

# 6. Test
```

#### Day 4: Purchase Orders & Bills
```bash
# 1. Create models
touch models/PurchaseOrder.js
touch models/PurchaseBill.js

# 2. Create controllers
touch controllers/purchaseOrderController.js
touch controllers/purchaseBillController.js

# 3. Create routes
touch routes/purchaseOrderRoutes.js
touch routes/purchaseBillRoutes.js

# 4. Register in server.js
# app.use('/api/purchase/po', purchaseOrderRoutes);
# app.use('/api/purchase/bills', purchaseBillRoutes);

# 5. Test all purchase flow
```

---

## 📋 Complete API Endpoints Checklist

### Engineering Module

#### Projects ⚠️
- [ ] GET /api/engineering/projects
- [ ] GET /api/engineering/projects/:id
- [ ] POST /api/engineering/projects
- [ ] PUT /api/engineering/projects/:id
- [ ] DELETE /api/engineering/projects/:id
- [ ] GET /api/engineering/projects/:id/stats

#### Estimates ❌
- [ ] GET /api/engineering/estimates
- [ ] GET /api/engineering/estimates/:id
- [ ] GET /api/engineering/estimates/by-project/:projectId
- [ ] POST /api/engineering/estimates
- [ ] PUT /api/engineering/estimates/:id
- [ ] DELETE /api/engineering/estimates/:id
- [ ] POST /api/engineering/estimates/:id/submit
- [ ] POST /api/engineering/estimates/:id/approve
- [ ] POST /api/engineering/estimates/:id/reject

#### Documents ❌
- [ ] GET /api/engineering/documents
- [ ] GET /api/engineering/documents/:id
- [ ] GET /api/engineering/documents/by-project/:projectId
- [ ] POST /api/engineering/documents
- [ ] PUT /api/engineering/documents/:id
- [ ] DELETE /api/engineering/documents/:id
- [ ] GET /api/engineering/documents/:id/download

#### Items ⚠️
- [ ] GET /api/items
- [ ] GET /api/items/:id
- [ ] GET /api/items/by-category/:category
- [ ] POST /api/items
- [ ] PUT /api/items/:id
- [ ] DELETE /api/items/:id

### Purchase Module

#### Material Requisitions ✅ (Already Done)
- [x] GET /api/purchase/mr
- [x] GET /api/purchase/mr/:id
- [x] POST /api/purchase/mr
- [x] PUT /api/purchase/mr/:id
- [x] POST /api/purchase/mr/:id/approve

#### Quotations ❌
- [ ] GET /api/purchase/quotations
- [ ] GET /api/purchase/quotations/:id
- [ ] GET /api/purchase/quotations/by-mr/:mrId
- [ ] POST /api/purchase/quotations
- [ ] PUT /api/purchase/quotations/:id
- [ ] DELETE /api/purchase/quotations/:id
- [ ] POST /api/purchase/quotations/:id/submit

#### Comparative Statements ❌
- [ ] GET /api/purchase/comparative
- [ ] GET /api/purchase/comparative/:id
- [ ] POST /api/purchase/comparative
- [ ] PUT /api/purchase/comparative/:id
- [ ] POST /api/purchase/comparative/:id/select-supplier
- [ ] POST /api/purchase/comparative/:id/approve

#### Purchase Orders ❌
- [ ] GET /api/purchase/po
- [ ] GET /api/purchase/po/:id
- [ ] POST /api/purchase/po
- [ ] PUT /api/purchase/po/:id
- [ ] POST /api/purchase/po/:id/submit
- [ ] POST /api/purchase/po/:id/approve
- [ ] POST /api/purchase/po/:id/issue
- [ ] POST /api/purchase/po/:id/cancel

#### Purchase Bills ❌
- [ ] GET /api/purchase/bills
- [ ] GET /api/purchase/bills/:id
- [ ] POST /api/purchase/bills
- [ ] PUT /api/purchase/bills/:id
- [ ] POST /api/purchase/bills/:id/verify
- [ ] POST /api/purchase/bills/:id/approve
- [ ] POST /api/purchase/bills/:id/pay

#### Suppliers ✅ (Already Done)
- [x] GET /api/purchase/suppliers
- [x] GET /api/purchase/suppliers/:id
- [x] POST /api/purchase/suppliers
- [x] PUT /api/purchase/suppliers/:id
- [x] DELETE /api/purchase/suppliers/:id

---

## 🎯 Summary

### Already Have ✅
- Authentication & Users
- Suppliers API
- Material Requisitions API
- Project & Item Models

### Need to Build ⚠️❌

**Engineering Module (4 APIs)**:
1. Projects API (model exists, need endpoints)
2. Estimates API (full implementation)
3. Documents API (full implementation)
4. Items API (model exists, need endpoints)

**Purchase Module (4 APIs)**:
1. Quotations API (full implementation)
2. Comparative Statements API (full implementation)
3. Purchase Orders API (full implementation)
4. Purchase Bills API (full implementation)

### Effort Estimate
- **Engineering Module**: 12-16 hours
- **Purchase Module**: 12-16 hours
- **Seed Data**: 3-4 hours
- **Testing**: 4-6 hours
- **Total**: ~32-42 hours (4-5 working days)

### Dependencies
- MongoDB connection (already configured)
- Authentication middleware (already exists)
- User & Role system (already exists)
- Suppliers & MRs (already working)

---

## 🚀 Quick Start Commands

```bash
# Create all model files
mkdir -p models
touch models/{Project,Item,Estimate,Document,Quotation,ComparativeStatement,PurchaseOrder,PurchaseBill}.js

# Create all controller files
mkdir -p controllers
touch controllers/{project,item,estimate,document,quotation,comparativeStatement,purchaseOrder,purchaseBill}Controller.js

# Create all route files
mkdir -p routes
touch routes/{project,item,estimate,document,quotation,comparativeStatement,purchaseOrder,purchaseBill}Routes.js

# Create seed scripts
mkdir -p scripts/seeds
touch scripts/seeds/{seedProjects,seedItems,seedMRs,seedQuotations,seedAll}.js

# Run seeds (after implementation)
node scripts/seeds/seedAll.js
```

---

## 📝 Notes

1. **All models include**:
   - Audit fields (createdBy, updatedBy, timestamps)
   - Auto-generated codes (PRJ-YYYY-NNNN format)
   - Proper indexes for performance

2. **All APIs include**:
   - Authentication middleware
   - Role-based access control
   - Input validation
   - Error handling
   - Pagination support

3. **Seed data is realistic**:
   - Real construction materials
   - Proper HSN codes for GST
   - Actual project scenarios
   - Complete workflow coverage

4. **Priority order**:
   - Phase 1: Projects + Items (needed by everything)
   - Phase 2: Estimates + Documents (engineering workflows)
   - Phase 3: Quotations + CS (purchase workflows)
   - Phase 4: POs + Bills (complete purchase cycle)

This document gives you everything needed to build both modules completely!
