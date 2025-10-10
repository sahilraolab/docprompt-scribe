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

## 🛠️ COMPLETE CONTROLLERS & ROUTES IMPLEMENTATION

---

## 1️⃣ PROJECTS CONTROLLER & ROUTES

### Controller: `controllers/projectController.js`

```javascript
const Project = require('../models/Project');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('managerId', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: projects,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('managerId', 'name email phone')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create project
exports.createProject = async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      createdBy: req.user.id
    });

    await project.save();
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete project (soft delete)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled', updatedBy: req.user.id },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ success: true, message: 'Project cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get project statistics
exports.getProjectStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get related data counts (you can expand this)
    const MR = require('../models/MaterialRequisition');
    const Estimate = require('../models/Estimate');
    
    const [mrCount, estimateCount] = await Promise.all([
      MR.countDocuments({ projectId: project._id }),
      Estimate.countDocuments({ projectId: project._id })
    ]);

    res.json({
      project: {
        name: project.name,
        code: project.code,
        budget: project.budget,
        spent: project.spent,
        progress: project.progress,
        status: project.status
      },
      stats: {
        materialRequisitions: mrCount,
        estimates: estimateCount,
        budgetUtilization: project.budget > 0 ? (project.spent / project.budget * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/projectRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// All routes require authentication
router.use(authenticate);

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.get('/:id/stats', projectController.getProjectStats);
router.post('/', authorize(['admin', 'project_manager']), projectController.createProject);
router.put('/:id', authorize(['admin', 'project_manager']), projectController.updateProject);
router.delete('/:id', authorize(['admin']), projectController.deleteProject);

module.exports = router;
```

---

## 2️⃣ ITEMS CONTROLLER & ROUTES

### Controller: `controllers/itemController.js`

```javascript
const Item = require('../models/Item');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const { category, search, isActive, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('createdBy', 'name')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single item
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const items = await Item.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ name: 1 });

    res.json({ data: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create item
exports.createItem = async (req, res) => {
  try {
    const item = new Item({
      ...req.body,
      createdBy: req.user.id
    });

    await item.save();
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deactivate item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user.id },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/itemRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(authenticate);

router.get('/', itemController.getAllItems);
router.get('/:id', itemController.getItemById);
router.get('/by-category/:category', itemController.getItemsByCategory);
router.post('/', authorize(['admin', 'inventory_manager']), itemController.createItem);
router.put('/:id', authorize(['admin', 'inventory_manager']), itemController.updateItem);
router.delete('/:id', authorize(['admin']), itemController.deleteItem);

module.exports = router;
```

---

## 3️⃣ ESTIMATES CONTROLLER & ROUTES

### Controller: `controllers/estimateController.js`

```javascript
const Estimate = require('../models/Estimate');
const Project = require('../models/Project');

// Get all estimates
exports.getAllEstimates = async (req, res) => {
  try {
    const { status, projectId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (projectId) query.projectId = projectId;

    const total = await Estimate.countDocuments(query);
    const estimates = await Estimate.find(query)
      .populate('projectId', 'name code')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: estimates,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single estimate
exports.getEstimateById = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id)
      .populate('projectId')
      .populate('createdBy', 'name email')
      .populate('submittedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('rejectedBy', 'name');

    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    res.json(estimate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get estimates by project
exports.getEstimatesByProject = async (req, res) => {
  try {
    const estimates = await Estimate.find({ projectId: req.params.projectId })
      .populate('createdBy', 'name')
      .sort({ version: -1 });

    res.json({ data: estimates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create estimate
exports.createEstimate = async (req, res) => {
  try {
    // Check if project exists
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const estimate = new Estimate({
      ...req.body,
      createdBy: req.user.id
    });

    await estimate.save();
    
    res.status(201).json({
      success: true,
      data: estimate
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update estimate
exports.updateEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    // Only allow updates if status is Draft
    if (estimate.status !== 'Draft') {
      return res.status(400).json({ 
        error: 'Cannot update estimate that is not in Draft status' 
      });
    }

    Object.assign(estimate, req.body);
    estimate.updatedBy = req.user.id;
    await estimate.save();

    res.json({ success: true, data: estimate });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete estimate
exports.deleteEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    if (estimate.status !== 'Draft') {
      return res.status(400).json({ 
        error: 'Cannot delete estimate that is not in Draft status' 
      });
    }

    await estimate.deleteOne();
    res.json({ success: true, message: 'Estimate deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit estimate for approval
exports.submitEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    if (estimate.status !== 'Draft') {
      return res.status(400).json({ error: 'Estimate already submitted' });
    }

    estimate.status = 'Pending';
    estimate.submittedAt = new Date();
    estimate.submittedBy = req.user.id;
    await estimate.save();

    res.json({ success: true, data: estimate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve estimate
exports.approveEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    if (estimate.status !== 'Pending') {
      return res.status(400).json({ error: 'Estimate is not pending approval' });
    }

    estimate.status = 'Approved';
    estimate.approvedAt = new Date();
    estimate.approvedBy = req.user.id;
    estimate.approvalComments = req.body.comments;
    await estimate.save();

    res.json({ success: true, data: estimate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject estimate
exports.rejectEstimate = async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }

    if (estimate.status !== 'Pending') {
      return res.status(400).json({ error: 'Estimate is not pending approval' });
    }

    estimate.status = 'Rejected';
    estimate.rejectedAt = new Date();
    estimate.rejectedBy = req.user.id;
    estimate.approvalComments = req.body.comments || 'Rejected';
    await estimate.save();

    res.json({ success: true, data: estimate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/estimateRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(authenticate);

router.get('/', estimateController.getAllEstimates);
router.get('/:id', estimateController.getEstimateById);
router.get('/by-project/:projectId', estimateController.getEstimatesByProject);
router.post('/', authorize(['admin', 'engineer', 'project_manager']), estimateController.createEstimate);
router.put('/:id', authorize(['admin', 'engineer', 'project_manager']), estimateController.updateEstimate);
router.delete('/:id', authorize(['admin', 'project_manager']), estimateController.deleteEstimate);
router.post('/:id/submit', authorize(['admin', 'engineer', 'project_manager']), estimateController.submitEstimate);
router.post('/:id/approve', authorize(['admin', 'project_manager']), estimateController.approveEstimate);
router.post('/:id/reject', authorize(['admin', 'project_manager']), estimateController.rejectEstimate);

module.exports = router;
```

---

## 4️⃣ DOCUMENTS CONTROLLER & ROUTES

### Controller: `controllers/documentController.js`

```javascript
const Document = require('../models/Document');
const Project = require('../models/Project');

// Get all documents
exports.getAllDocuments = async (req, res) => {
  try {
    const { type, projectId, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (projectId) query.projectId = projectId;

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('projectId', 'name code')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: documents,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single document
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('projectId')
      .populate('uploadedBy', 'name email')
      .populate('createdBy', 'name');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get documents by project
exports.getDocumentsByProject = async (req, res) => {
  try {
    const { type, isLatest } = req.query;
    const query = { projectId: req.params.projectId };
    
    if (type) query.type = type;
    if (isLatest !== undefined) query.isLatest = isLatest === 'true';

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name')
      .sort({ type: 1, version: -1 });

    res.json({ data: documents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload document
exports.createDocument = async (req, res) => {
  try {
    // Check if project exists
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Mark previous versions as not latest
    if (req.body.name && req.body.type) {
      await Document.updateMany(
        { 
          projectId: req.body.projectId,
          name: req.body.name,
          type: req.body.type
        },
        { isLatest: false }
      );
    }

    const document = new Document({
      ...req.body,
      uploadedBy: req.user.id,
      createdBy: req.user.id
    });

    await document.save();
    
    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update document metadata
exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        tags: req.body.tags
      },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // TODO: Delete actual file from storage (S3, etc.)

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Return the URL for frontend to handle download
    // Or implement actual file streaming here
    res.json({ 
      success: true, 
      url: document.url,
      name: document.name 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/documentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(authenticate);

router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.get('/by-project/:projectId', documentController.getDocumentsByProject);
router.get('/:id/download', documentController.downloadDocument);
router.post('/', authorize(['admin', 'engineer', 'project_manager']), documentController.createDocument);
router.put('/:id', authorize(['admin', 'engineer', 'project_manager']), documentController.updateDocument);
router.delete('/:id', authorize(['admin', 'project_manager']), documentController.deleteDocument);

module.exports = router;
```

---

## 5️⃣ QUOTATIONS CONTROLLER & ROUTES

### Controller: `controllers/quotationController.js`

```javascript
const Quotation = require('../models/Quotation');
const MR = require('../models/MaterialRequisition');
const Supplier = require('../models/Supplier');

// Get all quotations
exports.getAllQuotations = async (req, res) => {
  try {
    const { status, mrId, supplierId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (mrId) query.mrId = mrId;
    if (supplierId) query.supplierId = supplierId;

    const total = await Quotation.countDocuments(query);
    const quotations = await Quotation.find(query)
      .populate('mrId', 'code projectId')
      .populate('supplierId', 'name contact')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: quotations,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single quotation
exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('mrId')
      .populate('supplierId')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name');

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    res.json(quotation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get quotations by MR
exports.getQuotationsByMR = async (req, res) => {
  try {
    const quotations = await Quotation.find({ mrId: req.params.mrId })
      .populate('supplierId', 'name contact email')
      .sort({ grandTotal: 1 }); // Sort by price

    res.json({ data: quotations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create quotation
exports.createQuotation = async (req, res) => {
  try {
    // Verify MR exists
    const mr = await MR.findById(req.body.mrId);
    if (!mr) {
      return res.status(404).json({ error: 'Material Requisition not found' });
    }

    // Verify Supplier exists
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const quotation = new Quotation({
      ...req.body,
      createdBy: req.user.id
    });

    await quotation.save();
    
    res.status(201).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update quotation
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Only allow updates if status is Draft
    if (quotation.status !== 'Draft') {
      return res.status(400).json({ 
        error: 'Cannot update quotation that is not in Draft status' 
      });
    }

    Object.assign(quotation, req.body);
    quotation.updatedBy = req.user.id;
    await quotation.save();

    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete quotation
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (quotation.status !== 'Draft') {
      return res.status(400).json({ 
        error: 'Cannot delete quotation that is not in Draft status' 
      });
    }

    await quotation.deleteOne();
    res.json({ success: true, message: 'Quotation deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit quotation
exports.submitQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (quotation.status !== 'Draft') {
      return res.status(400).json({ error: 'Quotation already submitted' });
    }

    quotation.status = 'Submitted';
    await quotation.save();

    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/quotationRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(authenticate);

router.get('/', quotationController.getAllQuotations);
router.get('/:id', quotationController.getQuotationById);
router.get('/by-mr/:mrId', quotationController.getQuotationsByMR);
router.post('/', authorize(['admin', 'purchase_manager']), quotationController.createQuotation);
router.put('/:id', authorize(['admin', 'purchase_manager']), quotationController.updateQuotation);
router.delete('/:id', authorize(['admin', 'purchase_manager']), quotationController.deleteQuotation);
router.post('/:id/submit', authorize(['admin', 'purchase_manager']), quotationController.submitQuotation);

module.exports = router;
```

---

## 6️⃣ COMPARATIVE STATEMENTS CONTROLLER & ROUTES

### Controller: `controllers/comparativeStatementController.js`

```javascript
const ComparativeStatement = require('../models/ComparativeStatement');
const Quotation = require('../models/Quotation');
const MR = require('../models/MaterialRequisition');

// Get all comparative statements
exports.getAllCS = async (req, res) => {
  try {
    const { status, mrId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (mrId) query.mrId = mrId;

    const total = await ComparativeStatement.countDocuments(query);
    const statements = await ComparativeStatement.find(query)
      .populate('mrId', 'code projectId')
      .populate('quotations')
      .populate('selectedSupplierId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: statements,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single CS
exports.getCSById = async (req, res) => {
  try {
    const cs = await ComparativeStatement.findById(req.params.id)
      .populate({
        path: 'mrId',
        populate: { path: 'projectId', select: 'name code' }
      })
      .populate({
        path: 'quotations',
        populate: { path: 'supplierId', select: 'name contact email' }
      })
      .populate('selectedSupplierId')
      .populate('approvedBy', 'name')
      .populate('createdBy', 'name email');

    if (!cs) {
      return res.status(404).json({ error: 'Comparative Statement not found' });
    }

    res.json(cs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create CS
exports.createCS = async (req, res) => {
  try {
    const { mrId, quotations } = req.body;

    // Verify MR exists
    const mr = await MR.findById(mrId);
    if (!mr) {
      return res.status(404).json({ error: 'Material Requisition not found' });
    }

    // Verify all quotations exist and belong to the MR
    const quotes = await Quotation.find({ 
      _id: { $in: quotations },
      mrId: mrId 
    });

    if (quotes.length !== quotations.length) {
      return res.status(400).json({ 
        error: 'Some quotations not found or do not belong to this MR' 
      });
    }

    // Build comparison matrix
    const comparisonMatrix = quotes.map(q => ({
      quotationId: q._id,
      supplierId: q.supplierId,
      supplierName: '', // Will be populated
      subtotal: q.subtotal,
      taxTotal: q.taxTotal,
      grandTotal: q.grandTotal,
      deliveryTerms: q.notes,
      items: q.items
    }));

    const cs = new ComparativeStatement({
      mrId,
      quotations,
      comparisonMatrix,
      createdBy: req.user.id
    });

    await cs.save();
    
    // Populate for response
    await cs.populate('quotations supplierId');
    
    res.status(201).json({
      success: true,
      data: cs
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update CS
exports.updateCS = async (req, res) => {
  try {
    const cs = await ComparativeStatement.findById(req.params.id);
    
    if (!cs) {
      return res.status(404).json({ error: 'Comparative Statement not found' });
    }

    if (cs.status !== 'Draft') {
      return res.status(400).json({ 
        error: 'Cannot update CS that is not in Draft status' 
      });
    }

    const { analysis, recommendations } = req.body;
    cs.analysis = analysis;
    cs.recommendations = recommendations;
    cs.updatedBy = req.user.id;
    
    await cs.save();

    res.json({ success: true, data: cs });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Select supplier
exports.selectSupplier = async (req, res) => {
  try {
    const cs = await ComparativeStatement.findById(req.params.id);
    
    if (!cs) {
      return res.status(404).json({ error: 'Comparative Statement not found' });
    }

    cs.selectedSupplierId = req.body.supplierId;
    cs.status = 'UnderReview';
    cs.updatedBy = req.user.id;
    
    await cs.save();

    res.json({ success: true, data: cs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve CS
exports.approveCS = async (req, res) => {
  try {
    const cs = await ComparativeStatement.findById(req.params.id);
    
    if (!cs) {
      return res.status(404).json({ error: 'Comparative Statement not found' });
    }

    if (!cs.selectedSupplierId) {
      return res.status(400).json({ error: 'No supplier selected' });
    }

    cs.status = 'Approved';
    cs.approvedBy = req.user.id;
    cs.approvedAt = new Date();
    
    await cs.save();

    res.json({ success: true, data: cs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/comparativeStatementRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const csController = require('../controllers/comparativeStatementController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(authenticate);

router.get('/', csController.getAllCS);
router.get('/:id', csController.getCSById);
router.post('/', authorize(['admin', 'purchase_manager']), csController.createCS);
router.put('/:id', authorize(['admin', 'purchase_manager']), csController.updateCS);
router.post('/:id/select-supplier', authorize(['admin', 'purchase_manager']), csController.selectSupplier);
router.post('/:id/approve', authorize(['admin', 'purchase_manager', 'project_manager']), csController.approveCS);

module.exports = router;
```

---

## 7️⃣ PURCHASE ORDERS CONTROLLER & ROUTES

### Controller: `controllers/purchaseOrderController.js`

```javascript
const PurchaseOrder = require('../models/PurchaseOrder');
const Project = require('../models/Project');
const Supplier = require('../models/Supplier');

// Get all POs
exports.getAllPOs = async (req, res) => {
  try {
    const { status, projectId, supplierId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (projectId) query.projectId = projectId;
    if (supplierId) query.supplierId = supplierId;

    const total = await PurchaseOrder.countDocuments(query);
    const pos = await PurchaseOrder.find(query)
      .populate('projectId', 'name code')
      .populate('supplierId', 'name contact')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: pos,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single PO
exports.getPOById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('projectId')
      .populate('supplierId')
      .populate('mrId', 'code')
      .populate('quotationId', 'code')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name');

    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    res.json(po);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create PO
exports.createPO = async (req, res) => {
  try {
    const { projectId, supplierId } = req.body;

    // Verify Project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify Supplier exists
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const po = new PurchaseOrder({
      ...req.body,
      createdBy: req.user.id
    });

    await po.save();
    
    res.status(201).json({
      success: true,
      data: po
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update PO
exports.updatePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    // Only allow updates if status is Draft
    if (po.status !== 'Draft') {
      return res.status(400).json({ 
        error: 'Cannot update PO that is not in Draft status' 
      });
    }

    Object.assign(po, req.body);
    po.updatedBy = req.user.id;
    await po.save();

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Submit for approval
exports.submitPO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    if (po.status !== 'Draft') {
      return res.status(400).json({ error: 'PO already submitted' });
    }

    po.status = 'PendingApproval';
    po.submittedAt = new Date();
    await po.save();

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve PO
exports.approvePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    if (po.status !== 'PendingApproval') {
      return res.status(400).json({ error: 'PO is not pending approval' });
    }

    po.status = 'Approved';
    po.approvedBy = req.user.id;
    po.approvedAt = new Date();
    await po.save();

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Issue to supplier
exports.issuePO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    if (po.status !== 'Approved') {
      return res.status(400).json({ error: 'PO is not approved' });
    }

    po.status = 'Issued';
    po.issuedAt = new Date();
    await po.save();

    // TODO: Send email/notification to supplier

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel PO
exports.cancelPO = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    if (['FullyReceived', 'Cancelled'].includes(po.status)) {
      return res.status(400).json({ error: 'Cannot cancel this PO' });
    }

    po.status = 'Cancelled';
    po.remarks = req.body.reason || 'Cancelled by user';
    po.updatedBy = req.user.id;
    await po.save();

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/purchaseOrderRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const poController = require('../controllers/purchaseOrderController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(authenticate);

router.get('/', poController.getAllPOs);
router.get('/:id', poController.getPOById);
router.post('/', authorize(['admin', 'purchase_manager']), poController.createPO);
router.put('/:id', authorize(['admin', 'purchase_manager']), poController.updatePO);
router.post('/:id/submit', authorize(['admin', 'purchase_manager']), poController.submitPO);
router.post('/:id/approve', authorize(['admin', 'project_manager', 'finance_manager']), poController.approvePO);
router.post('/:id/issue', authorize(['admin', 'purchase_manager']), poController.issuePO);
router.post('/:id/cancel', authorize(['admin', 'purchase_manager']), poController.cancelPO);

module.exports = router;
```

---

## 8️⃣ PURCHASE BILLS CONTROLLER & ROUTES

### Controller: `controllers/purchaseBillController.js`

```javascript
const PurchaseBill = require('../models/PurchaseBill');
const PurchaseOrder = require('../models/PurchaseOrder');

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const { status, poId, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (poId) query.poId = poId;

    const total = await PurchaseBill.countDocuments(query);
    const bills = await PurchaseBill.find(query)
      .populate({
        path: 'poId',
        select: 'code projectId supplierId',
        populate: [
          { path: 'projectId', select: 'name code' },
          { path: 'supplierId', select: 'name' }
        ]
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      data: bills,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single bill
exports.getBillById = async (req, res) => {
  try {
    const bill = await PurchaseBill.findById(req.params.id)
      .populate({
        path: 'poId',
        populate: [
          { path: 'projectId' },
          { path: 'supplierId' }
        ]
      })
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name')
      .populate('approvedBy', 'name');

    if (!bill) {
      return res.status(404).json({ error: 'Purchase Bill not found' });
    }

    res.json(bill);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create bill
exports.createBill = async (req, res) => {
  try {
    const { poId } = req.body;

    // Verify PO exists
    const po = await PurchaseOrder.findById(poId);
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    if (!['Issued', 'PartiallyReceived', 'FullyReceived'].includes(po.status)) {
      return res.status(400).json({ error: 'PO is not in valid status for billing' });
    }

    const bill = new PurchaseBill({
      ...req.body,
      createdBy: req.user.id
    });

    await bill.save();
    
    res.status(201).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update bill
exports.updateBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ error: 'Purchase Bill not found' });
    }

    if (bill.status !== 'Pending') {
      return res.status(400).json({ 
        error: 'Cannot update bill that is not Pending' 
      });
    }

    Object.assign(bill, req.body);
    bill.updatedBy = req.user.id;
    await bill.save();

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Verify bill
exports.verifyBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ error: 'Purchase Bill not found' });
    }

    if (bill.status !== 'Pending') {
      return res.status(400).json({ error: 'Bill is not pending verification' });
    }

    bill.status = 'Verified';
    bill.verifiedBy = req.user.id;
    bill.verifiedAt = new Date();
    await bill.save();

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve bill
exports.approveBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ error: 'Purchase Bill not found' });
    }

    if (bill.status !== 'Verified') {
      return res.status(400).json({ error: 'Bill is not verified' });
    }

    bill.status = 'Approved';
    bill.approvedBy = req.user.id;
    bill.approvedAt = new Date();
    await bill.save();

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record payment
exports.payBill = async (req, res) => {
  try {
    const bill = await PurchaseBill.findById(req.params.id);
    
    if (!bill) {
      return res.status(404).json({ error: 'Purchase Bill not found' });
    }

    if (bill.status !== 'Approved') {
      return res.status(400).json({ error: 'Bill is not approved for payment' });
    }

    const { paidAmount, paymentDate } = req.body;

    bill.paidAmount = paidAmount;
    bill.paymentDate = paymentDate || new Date();
    bill.status = 'Paid';
    bill.updatedBy = req.user.id;
    await bill.save();

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes: `routes/purchaseBillRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const billController = require('../controllers/purchaseBillController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(authenticate);

router.get('/', billController.getAllBills);
router.get('/:id', billController.getBillById);
router.post('/', authorize(['admin', 'purchase_manager', 'accounts_manager']), billController.createBill);
router.put('/:id', authorize(['admin', 'purchase_manager', 'accounts_manager']), billController.updateBill);
router.post('/:id/verify', authorize(['admin', 'purchase_manager']), billController.verifyBill);
router.post('/:id/approve', authorize(['admin', 'finance_manager']), billController.approveBill);
router.post('/:id/pay', authorize(['admin', 'finance_manager', 'accounts_manager']), billController.payBill);

module.exports = router;
```

---

## 🔧 SERVER.JS INTEGRATION

Add all routes to your `server.js` or `app.js`:

```javascript
// Import routes
const projectRoutes = require('./routes/projectRoutes');
const itemRoutes = require('./routes/itemRoutes');
const estimateRoutes = require('./routes/estimateRoutes');
const documentRoutes = require('./routes/documentRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const comparativeStatementRoutes = require('./routes/comparativeStatementRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const purchaseBillRoutes = require('./routes/purchaseBillRoutes');

// Register routes
app.use('/api/engineering/projects', projectRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/engineering/estimates', estimateRoutes);
app.use('/api/engineering/documents', documentRoutes);
app.use('/api/purchase/quotations', quotationRoutes);
app.use('/api/purchase/comparative', comparativeStatementRoutes);
app.use('/api/purchase/po', purchaseOrderRoutes);
app.use('/api/purchase/bills', purchaseBillRoutes);
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
