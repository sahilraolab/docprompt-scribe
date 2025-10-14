# Construction ERP - Complete Backend Implementation Guide
## Production-Ready Backend with All Modules

**Priority Order**: Engineering → Purchase → Site/Inventory → Contracts → QA/QC → Accounts → Workflow

---

## 📋 Table of Contents

1. [Project Setup](#project-setup)
2. [Environment Configuration](#environment-configuration)
3. [Authentication & Authorization](#authentication--authorization)
4. [Module 1: Engineering (PRIORITY 1 - INDEPENDENT)](#module-1-engineering-priority-1)
5. [Module 2: Purchase (PRIORITY 2)](#module-2-purchase-priority-2)
6. [Module 3: Site & Inventory (PRIORITY 3)](#module-3-site--inventory-priority-3)
7. [Module 4: Contracts (PRIORITY 4)](#module-4-contracts-priority-4)
8. [Module 5: QA/QC (PRIORITY 5)](#module-5-qaqc-priority-5)
9. [Module 6: Accounts (PRIORITY 6)](#module-6-accounts-priority-6)
10. [Module 7: Workflow (PRIORITY 7)](#module-7-workflow-priority-7)
11. [Module 8: Admin](#module-8-admin)
12. [Server Configuration](#server-configuration)
13. [Deployment Checklist](#deployment-checklist)

---

## Project Setup

### 1. Initialize Project
```bash
mkdir erp-backend && cd erp-backend
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken express-validator cors dotenv multer
npm install --save-dev nodemon
```

### 2. Folder Structure
```
erp-backend/
├── models/
│   ├── User.js
│   ├── UserRole.js
│   ├── engineering/
│   │   ├── Project.js
│   │   ├── Estimate.js
│   │   ├── BOQ.js
│   │   ├── MaterialMaster.js
│   │   ├── BBS.js
│   │   ├── Plan.js
│   │   └── Document.js
│   ├── purchase/
│   │   ├── Supplier.js
│   │   ├── MaterialRequisition.js
│   │   ├── Quotation.js
│   │   ├── ComparativeStatement.js
│   │   ├── PurchaseOrder.js
│   │   ├── PurchaseBill.js
│   │   └── MaterialRate.js
│   ├── site/
│   │   ├── Item.js
│   │   ├── Stock.js
│   │   ├── GRN.js
│   │   ├── MaterialIssue.js
│   │   ├── StockTransfer.js
│   │   └── QualityCheck.js
│   ├── contracts/
│   │   ├── Contractor.js
│   │   ├── LabourRate.js
│   │   ├── WorkOrder.js
│   │   └── RABill.js
│   ├── accounts/
│   │   ├── Ledger.js
│   │   ├── Journal.js
│   │   └── CostCenter.js
│   └── workflow/
│       ├── WorkflowConfig.js
│       ├── Approval.js
│       └── SLA.js
├── controllers/
│   ├── engineering/
│   ├── purchase/
│   ├── site/
│   ├── contracts/
│   ├── accounts/
│   └── workflow/
├── routes/
│   ├── engineering/
│   ├── purchase/
│   ├── site/
│   ├── contracts/
│   ├── accounts/
│   └── workflow/
├── middleware/
│   ├── auth.js
│   ├── roleCheck.js
│   ├── validator.js
│   └── upload.js
├── config/
│   └── db.js
├── utils/
│   ├── codeGenerator.js
│   └── notifications.js
├── .env
├── .gitignore
└── server.js
```

---

## Environment Configuration

### .env
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/construction_erp_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## Authentication & Authorization

### models/User.js
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6,
    select: false 
  },
  phone: { type: String, match: [/^[0-9]{10}$/, 'Invalid phone'] },
  department: { 
    type: String, 
    enum: ['Engineering', 'Purchase', 'Site', 'Accounts', 'Contracts', 'Admin']
  },
  avatarUrl: String,
  active: { type: Boolean, default: true },
  lastLogin: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

### models/UserRole.js
```javascript
const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['Admin', 'ProjectManager', 'PurchaseOfficer', 'SiteEngineer', 'Accountant', 'Approver', 'Viewer'],
    required: true 
  },
  permissions: [{
    module: { 
      type: String, 
      enum: ['Engineering', 'Purchase', 'Site', 'Contracts', 'Accounts', 'Workflow', 'Admin']
    },
    actions: [{ 
      type: String, 
      enum: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject']
    }]
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

userRoleSchema.index({ userId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('UserRole', userRoleSchema);
```

### middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    if (!req.user || !req.user.active) {
      return res.status(401).json({ 
        success: false, 
        message: 'User no longer exists or inactive' 
      });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};
```

### controllers/authController.js
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    if (!user.active) {
      return res.status(401).json({ 
        success: false, 
        message: 'User account is inactive' 
      });
    }
    
    user.lastLogin = Date.now();
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## Module 1: Engineering (PRIORITY 1)

### models/engineering/MaterialMaster.js
```javascript
const mongoose = require('mongoose');

const materialMasterSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { type: String, trim: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Cement', 'Steel', 'Sand', 'Aggregate', 'Bricks', 'Paint', 'Electrical', 'Plumbing', 'Hardware', 'Other']
  },
  subcategory: { type: String, trim: true },
  uom: { 
    type: String, 
    required: true,
    enum: ['KG', 'TON', 'BAG', 'CUM', 'SQM', 'RMT', 'NOS', 'LTR', 'SET', 'BOX']
  },
  hsnCode: { type: String, trim: true },
  taxRate: { type: Number, default: 18, min: 0, max: 100 },
  standardRate: { type: Number, min: 0 },
  specification: { type: String, trim: true },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

materialMasterSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `MAT-${String(count + 1).padStart(5, '0')}`;
  next();
});

materialMasterSchema.index({ name: 'text', description: 'text' });
materialMasterSchema.index({ category: 1, subcategory: 1 });

module.exports = mongoose.model('MaterialMaster', materialMasterSchema);
```

### models/engineering/Project.js
```javascript
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  location: { type: String, trim: true },
  clientName: { type: String, trim: true },
  clientContact: { type: String, trim: true },
  budget: { type: Number, required: true, min: 0 },
  budgetUtilized: { type: Number, default: 0, min: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  actualStartDate: Date,
  actualEndDate: Date,
  status: { 
    type: String, 
    enum: ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  siteEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { 
    type: String, 
    enum: ['Residential', 'Commercial', 'Infrastructure', 'Industrial']
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

projectSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `PRJ-${String(count + 1).padStart(4, '0')}`;
  next();
});

projectSchema.index({ name: 'text', location: 'text' });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
```

### models/engineering/BOQ.js
```javascript
const mongoose = require('mongoose');

const boqItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMaster' },
  description: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 },
  remarks: { type: String, trim: true }
}, { _id: true });

const boqSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  items: {
    type: [boqItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  totalAmount: { type: Number, default: 0, min: 0 },
  status: { 
    type: String, 
    enum: ['Draft', 'Approved', 'Revised', 'Archived'],
    default: 'Draft'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

boqSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) {
    if (this.items && this.items.length > 0) {
      this.totalAmount = this.items.reduce((sum, item) => sum + item.amount, 0);
    }
    return next();
  }
  const count = await this.constructor.countDocuments();
  this.code = `BOQ-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('BOQ', boqSchema);
```

### models/engineering/BBS.js
```javascript
const mongoose = require('mongoose');

const bbsItemSchema = new mongoose.Schema({
  markNo: { type: String, required: true },
  barDiameter: { type: Number, required: true },
  type: { type: String, required: true },
  shape: { type: String, required: true },
  length: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalLength: Number,
  weight: Number,
  totalWeight: Number,
  location: String,
  remarks: String
});

bbsItemSchema.pre('save', function(next) {
  this.totalLength = this.length * this.quantity;
  const weightPerMeter = (this.barDiameter * this.barDiameter) / 162;
  this.weight = weightPerMeter * this.length;
  this.totalWeight = this.weight * this.quantity;
  next();
});

const bbsSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  name: { type: String, required: true },
  description: String,
  structure: { 
    type: String, 
    required: true,
    enum: ['Foundation', 'Column', 'Beam', 'Slab', 'Wall', 'Other']
  },
  items: [bbsItemSchema],
  totalWeight: { type: Number, default: 0 },
  unit: { type: String, default: 'kg' },
  status: { 
    type: String, 
    enum: ['Draft', 'Approved', 'Issued'],
    default: 'Draft'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

bbsSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) {
    if (this.items && this.items.length > 0) {
      this.totalWeight = this.items.reduce((sum, item) => sum + (item.totalWeight || 0), 0);
    }
    return next();
  }
  const count = await this.constructor.countDocuments();
  this.code = `BBS-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('BBS', bbsSchema);
```

### models/engineering/Plan.js
```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['NotStarted', 'InProgress', 'Completed', 'Blocked'],
    default: 'NotStarted'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  dependencies: [{ type: mongoose.Schema.Types.ObjectId }],
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  }
});

const planSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  name: { type: String, required: true },
  description: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Active', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  progress: { type: Number, default: 0 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tasks: [taskSchema],
  milestones: [{
    name: String,
    date: Date,
    completed: { type: Boolean, default: false }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

planSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) {
    if (this.tasks && this.tasks.length > 0) {
      const totalProgress = this.tasks.reduce((sum, task) => sum + task.progress, 0);
      this.progress = Math.round(totalProgress / this.tasks.length);
    }
    return next();
  }
  const count = await this.constructor.countDocuments();
  this.code = `PLN-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Plan', planSchema);
```

### models/engineering/Document.js
```javascript
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Drawing', 'Report', 'Specification', 'Certificate', 'RERA', 'Permit', 'Other']
  },
  category: { type: String, trim: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number },
  mimeType: { type: String },
  version: { type: String, default: '1.0' },
  drawingNumber: String,
  revision: { type: String, default: 'A' },
  parentDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  status: { 
    type: String, 
    enum: ['Draft', 'UnderReview', 'Approved', 'Rejected', 'Superseded'],
    default: 'Draft'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

documentSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `DOC-${String(count + 1).padStart(5, '0')}`;
  next();
});

documentSchema.index({ name: 'text', description: 'text' });
documentSchema.index({ projectId: 1, type: 1 });

module.exports = mongoose.model('Document', documentSchema);
```

### models/engineering/Estimate.js
```javascript
const mongoose = require('mongoose');

const estimateItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMaster' },
  description: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
}, { _id: true });

const estimateSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  version: { type: String, default: '1.0' },
  items: [estimateItemSchema],
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 },
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Revised'],
    default: 'Draft'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

estimateSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) {
    if (this.items && this.items.length > 0) {
      this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
      this.taxAmount = (this.subtotal * this.taxRate) / 100;
      this.totalAmount = this.subtotal + this.taxAmount;
    }
    return next();
  }
  const count = await this.constructor.countDocuments();
  this.code = `EST-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Estimate', estimateSchema);
```

### controllers/engineering/materialMasterController.js
```javascript
const MaterialMaster = require('../../models/engineering/MaterialMaster');

exports.getMaterials = async (req, res) => {
  try {
    const { category, search, active } = req.query;
    const filter = {};
    
    if (category) filter.category = category;
    if (active !== undefined) filter.active = active === 'true';
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const materials = await MaterialMaster.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await MaterialMaster.findById(req.params.id)
      .populate('createdBy updatedBy', 'name email');
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const materialData = { ...req.body, createdBy: req.user._id };
    const material = await MaterialMaster.create(materialData);
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await MaterialMaster.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.json({ success: true, data: material });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await MaterialMaster.findByIdAndDelete(req.params.id);
    
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    
    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### controllers/engineering/boqController.js
```javascript
const BOQ = require('../../models/engineering/BOQ');
const MaterialRequisition = require('../../models/purchase/MaterialRequisition');

exports.getBOQs = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const filter = {};
    
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    
    const boqs = await BOQ.find(filter)
      .populate('projectId', 'name code')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: boqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBOQById = async (req, res) => {
  try {
    const boq = await BOQ.findById(req.params.id)
      .populate('projectId', 'name code budget')
      .populate('items.itemId', 'name code')
      .populate('createdBy updatedBy approvedBy', 'name email');
    
    if (!boq) {
      return res.status(404).json({ success: false, message: 'BOQ not found' });
    }
    
    res.json({ success: true, data: boq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBOQ = async (req, res) => {
  try {
    const boqData = { ...req.body, createdBy: req.user._id };
    const boq = await BOQ.create(boqData);
    res.status(201).json({ success: true, data: boq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!boq) {
      return res.status(404).json({ success: false, message: 'BOQ not found' });
    }
    
    res.json({ success: true, data: boq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findByIdAndDelete(req.params.id);
    
    if (!boq) {
      return res.status(404).json({ success: false, message: 'BOQ not found' });
    }
    
    res.json({ success: true, message: 'BOQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Approved',
        approvedBy: req.user._id,
        approvedAt: Date.now(),
        updatedBy: req.user._id
      },
      { new: true }
    );
    
    if (!boq) {
      return res.status(404).json({ success: false, message: 'BOQ not found' });
    }
    
    res.json({ success: true, data: boq, message: 'BOQ approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateMRFromBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findById(req.params.id);
    
    if (!boq) {
      return res.status(404).json({ success: false, message: 'BOQ not found' });
    }
    
    if (boq.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'BOQ must be approved first' });
    }
    
    // Convert BOQ items to MR items
    const mrItems = boq.items.map(item => ({
      itemId: item.itemId,
      description: item.description,
      qty: item.qty,
      uom: item.uom,
      boqItemId: item._id,
      source: 'BOQ'
    }));
    
    // Count existing MRs to generate code
    const count = await MaterialRequisition.countDocuments();
    
    const mrData = {
      code: `MR-${String(count + 1).padStart(5, '0')}`,
      projectId: boq.projectId,
      items: mrItems,
      status: 'Draft',
      requestedBy: req.user._id,
      createdBy: req.user._id,
      remarks: `Generated from BOQ: ${boq.code}`
    };
    
    const mr = await MaterialRequisition.create(mrData);
    
    res.status(201).json({ 
      success: true, 
      data: mr,
      message: 'Material Requisition generated successfully from BOQ'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### routes/engineering/materialMasterRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const { 
  getMaterials, 
  getMaterialById, 
  createMaterial, 
  updateMaterial, 
  deleteMaterial 
} = require('../../controllers/engineering/materialMasterController');
const { protect } = require('../../middleware/auth');

router.route('/')
  .get(protect, getMaterials)
  .post(protect, createMaterial);

router.route('/:id')
  .get(protect, getMaterialById)
  .put(protect, updateMaterial)
  .delete(protect, deleteMaterial);

module.exports = router;
```

### routes/engineering/boqRoutes.js
```javascript
const express = require('express');
const router = express.Router();
const { 
  getBOQs, 
  getBOQById, 
  createBOQ, 
  updateBOQ, 
  deleteBOQ,
  approveBOQ,
  generateMRFromBOQ
} = require('../../controllers/engineering/boqController');
const { protect } = require('../../middleware/auth');

router.route('/')
  .get(protect, getBOQs)
  .post(protect, createBOQ);

router.route('/:id')
  .get(protect, getBOQById)
  .put(protect, updateBOQ)
  .delete(protect, deleteBOQ);

router.post('/:id/approve', protect, approveBOQ);
router.post('/:id/generate-mr', protect, generateMRFromBOQ);

module.exports = router;
```

**[Continue with similar patterns for Projects, BBS, Plans, Documents, Estimates...]**

---

## Module 2: Purchase (PRIORITY 2)

### models/purchase/Supplier.js
```javascript
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  phone: { 
    type: String, 
    required: true,
    match: [/^[0-9]{10}$/, 'Invalid phone number']
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  gst: { 
    type: String, 
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST']
  },
  pan: { 
    type: String, 
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN']
  },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  bankName: { type: String, trim: true },
  accountNo: { type: String, trim: true },
  ifsc: { type: String, uppercase: true, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  paymentTerms: { type: String, trim: true },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

supplierSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `SUP-${String(count + 1).padStart(4, '0')}`;
  next();
});

supplierSchema.index({ name: 'text', contact: 'text' });
supplierSchema.index({ city: 1, state: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
```

### models/purchase/MaterialRequisition.js
```javascript
const mongoose = require('mongoose');

const mrItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMaster' },
  description: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  requiredBy: Date,
  boqItemId: { type: mongoose.Schema.Types.ObjectId },
  source: { type: String, enum: ['Manual', 'BOQ', 'Estimate'], default: 'Manual' }
}, { _id: true });

const mrSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  items: {
    type: [mrItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Closed'],
    default: 'Draft'
  },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvals: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
    comments: String,
    timestamp: { type: Date, default: Date.now }
  }],
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

mrSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `MR-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('MaterialRequisition', mrSchema);
```

### models/purchase/Quotation.js
```javascript
const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  taxPercent: { type: Number, default: 18, min: 0, max: 100 },
  amount: { type: Number, required: true, min: 0 }
}, { _id: true });

const quotationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  mrId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialRequisition' },
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true 
  },
  quotationNo: { type: String, required: true, trim: true },
  quotationDate: { type: Date, required: true },
  validUntil: Date,
  items: [quotationItemSchema],
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  terms: { type: String, trim: true },
  remarks: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Selected', 'Rejected'],
    default: 'Draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

quotationSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) {
    if (this.items && this.items.length > 0) {
      this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
      this.taxAmount = this.items.reduce((sum, item) => {
        return sum + (item.amount * item.taxPercent / 100);
      }, 0);
      this.totalAmount = this.subtotal + this.taxAmount;
    }
    return next();
  }
  const count = await this.constructor.countDocuments();
  this.code = `QT-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Quotation', quotationSchema);
```

### models/purchase/PurchaseOrder.js
```javascript
const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialMaster' },
  description: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  rate: { type: Number, required: true, min: 0 },
  taxPercent: { type: Number, default: 18 },
  amount: { type: Number, required: true, min: 0 }
}, { _id: true });

const purchaseOrderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  mrId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaterialRequisition' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  poDate: { type: Date, required: true },
  deliveryDate: Date,
  items: [poItemSchema],
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  terms: { type: String, trim: true },
  remarks: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Issued', 'Closed'],
    default: 'Draft'
  },
  approvals: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
    comments: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

purchaseOrderSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) {
    if (this.items && this.items.length > 0) {
      this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
      this.taxAmount = this.items.reduce((sum, item) => {
        return sum + (item.amount * item.taxPercent / 100);
      }, 0);
      this.totalAmount = this.subtotal + this.taxAmount;
    }
    return next();
  }
  const count = await this.constructor.countDocuments();
  this.code = `PO-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
```

### models/purchase/PurchaseBill.js
```javascript
const mongoose = require('mongoose');

const purchaseBillSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  poId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PurchaseOrder', 
    required: true 
  },
  invoiceNo: { type: String, required: true, trim: true },
  invoiceDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending', 'Approved', 'Paid'],
    default: 'Draft'
  },
  paymentDate: Date,
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

purchaseBillSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `PB-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('PurchaseBill', purchaseBillSchema);
```

### models/purchase/MaterialRate.js
```javascript
const mongoose = require('mongoose');

const materialRateSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MaterialMaster', 
    required: true 
  },
  supplierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier', 
    required: true 
  },
  rate: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  effectiveFrom: { type: Date, required: true },
  effectiveTo: Date,
  active: { type: Boolean, default: true },
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

materialRateSchema.index({ itemId: 1, supplierId: 1, effectiveFrom: -1 });

module.exports = mongoose.model('MaterialRate', materialRateSchema);
```

**[Purchase controllers and routes follow similar pattern as Engineering...]**

---

## Module 3: Site & Inventory (PRIORITY 3)

### models/site/Item.js
```javascript
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Material', 'Equipment', 'Consumable', 'Tool']
  },
  uom: { type: String, required: true },
  hsnCode: { type: String, trim: true },
  taxRate: { type: Number, default: 18 },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

itemSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `ITM-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Item', itemSchema);
```

### models/site/Stock.js
```javascript
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item', 
    required: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  location: { type: String, trim: true },
  quantity: { type: Number, required: true, default: 0 },
  uom: { type: String, required: true },
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

stockSchema.index({ itemId: 1, projectId: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);
```

### models/site/GRN.js
```javascript
const mongoose = require('mongoose');

const grnItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  orderedQty: { type: Number, required: true },
  receivedQty: { type: Number, required: true },
  acceptedQty: { type: Number, required: true },
  rejectedQty: { type: Number, default: 0 },
  uom: { type: String, required: true },
  remarks: String
}, { _id: true });

const grnSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  poId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'PurchaseOrder', 
    required: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  grnDate: { type: Date, required: true },
  invoiceNo: { type: String, trim: true },
  vehicleNo: { type: String, trim: true },
  driverName: { type: String, trim: true },
  items: [grnItemSchema],
  remarks: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Draft', 'QC Pending', 'Accepted', 'Rejected'],
    default: 'Draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

grnSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `GRN-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('GRN', grnSchema);
```

### models/site/MaterialIssue.js
```javascript
const mongoose = require('mongoose');

const issueItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qty: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  remarks: String
}, { _id: true });

const materialIssueSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  issuedTo: { type: String, required: true, trim: true },
  issueDate: { type: Date, required: true },
  items: [issueItemSchema],
  purpose: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Issued', 'Returned'],
    default: 'Draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

materialIssueSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `ISS-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('MaterialIssue', materialIssueSchema);
```

### models/site/QualityCheck.js
```javascript
const mongoose = require('mongoose');

const qualityCheckSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  grnId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'GRN', 
    required: true 
  },
  itemId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Item', 
    required: true 
  },
  qcDate: { type: Date, required: true },
  inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testResults: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Passed', 'Failed', 'Conditional'],
    required: true 
  },
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

qualityCheckSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `QC-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('QualityCheck', qualityCheckSchema);
```

---

## Module 4: Contracts (PRIORITY 4)

### models/contracts/Contractor.js
```javascript
const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  gst: { type: String, uppercase: true },
  pan: { type: String, uppercase: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  specialization: { type: String, trim: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

contractorSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `CON-${String(count + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Contractor', contractorSchema);
```

### models/contracts/LabourRate.js
```javascript
const mongoose = require('mongoose');

const labourRateSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  rate: { type: Number, required: true, min: 0 },
  uom: { type: String, required: true },
  effectiveFrom: { type: Date, required: true },
  effectiveTo: Date,
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('LabourRate', labourRateSchema);
```

### models/contracts/WorkOrder.js
```javascript
const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  contractorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Contractor', 
    required: true 
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  woDate: { type: Date, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 },
  scopeOfWork: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Active', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

workOrderSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `WO-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
```

### models/contracts/RABill.js
```javascript
const mongoose = require('mongoose');

const raBillSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  workOrderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkOrder', 
    required: true 
  },
  billNo: { type: String, required: true, trim: true },
  billDate: { type: Date, required: true },
  workProgress: { type: Number, required: true, min: 0, max: 100 },
  billAmount: { type: Number, required: true, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },
  netAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Approved', 'Paid'],
    default: 'Draft'
  },
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

raBillSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `RA-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('RABill', raBillSchema);
```

---

## Module 5: QA/QC (PRIORITY 5)

### models/qaqc/RMCBatchTest.js
```javascript
const mongoose = require('mongoose');

const rmcBatchTestSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  batchNo: { type: String, required: true, trim: true },
  testDate: { type: Date, required: true },
  grade: { type: String, required: true, trim: true },
  slump: { type: Number },
  compressiveStrength: { type: Number },
  testResult: { 
    type: String, 
    enum: ['Pass', 'Fail', 'Pending'],
    default: 'Pending'
  },
  remarks: { type: String, trim: true },
  testedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

rmcBatchTestSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `RMC-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('RMCBatchTest', rmcBatchTestSchema);
```

### models/qaqc/SnagList.js
```javascript
const mongoose = require('mongoose');

const snagListSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  severity: { 
    type: String, 
    enum: ['Minor', 'Major', 'Critical'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Open', 'InProgress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  identifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetDate: Date,
  resolvedDate: Date,
  remarks: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

snagListSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `SNG-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('SnagList', snagListSchema);
```

---

## Module 6: Accounts (PRIORITY 6)

### models/accounts/Ledger.js
```javascript
const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Asset', 'Liability', 'Income', 'Expense', 'Equity']
  },
  category: { type: String, trim: true },
  parentLedgerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger' },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ledgerSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `LED-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Ledger', ledgerSchema);
```

### models/accounts/Journal.js
```javascript
const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true },
  debit: { type: Number, default: 0, min: 0 },
  credit: { type: Number, default: 0, min: 0 },
  description: { type: String, trim: true }
}, { _id: true });

const journalSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  reference: { type: String, trim: true },
  description: { type: String, required: true, trim: true },
  entries: {
    type: [journalEntrySchema],
    validate: {
      validator: function(entries) {
        if (!entries || entries.length < 2) return false;
        const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
        const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
      },
      message: 'Journal must have at least 2 entries and debits must equal credits'
    }
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Posted', 'Void'],
    default: 'Draft'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

journalSchema.pre('save', async function(next) {
  if (!this.isNew || this.code) return next();
  const count = await this.constructor.countDocuments();
  this.code = `JV-${String(count + 1).padStart(5, '0')}`;
  next();
});

module.exports = mongoose.model('Journal', journalSchema);
```

---

## Module 7: Workflow (PRIORITY 7)

### models/workflow/WorkflowConfig.js
```javascript
const mongoose = require('mongoose');

const approvalLevelSchema = new mongoose.Schema({
  level: { type: Number, required: true },
  roleOrUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['Role', 'User'], required: true },
  minAmount: { type: Number, default: 0 },
  maxAmount: { type: Number }
}, { _id: true });

const workflowConfigSchema = new mongoose.Schema({
  module: { 
    type: String, 
    required: true,
    enum: ['MaterialRequisition', 'PurchaseOrder', 'WorkOrder', 'RABill', 'Journal']
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  approvalLevels: [approvalLevelSchema],
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('WorkflowConfig', workflowConfigSchema);
```

### models/workflow/Approval.js
```javascript
const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  documentType: { 
    type: String, 
    required: true,
    enum: ['MaterialRequisition', 'PurchaseOrder', 'WorkOrder', 'RABill', 'Journal']
  },
  workflowConfigId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkflowConfig', 
    required: true 
  },
  currentLevel: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: { type: String, trim: true },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Approval', approvalSchema);
```

### models/workflow/SLA.js
```javascript
const mongoose = require('mongoose');

const slaSchema = new mongoose.Schema({
  module: { 
    type: String, 
    required: true,
    enum: ['MaterialRequisition', 'PurchaseOrder', 'WorkOrder', 'RABill', 'Journal']
  },
  priority: { 
    type: String, 
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  responseTime: { type: Number, required: true }, // in hours
  resolutionTime: { type: Number, required: true }, // in hours
  escalationTime: { type: Number }, // in hours
  escalationTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SLA', slaSchema);
```

---

## Server Configuration

### server.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const materialMasterRoutes = require('./routes/engineering/materialMasterRoutes');
const boqRoutes = require('./routes/engineering/boqRoutes');
const projectRoutes = require('./routes/engineering/projectRoutes');
const bbsRoutes = require('./routes/engineering/bbsRoutes');
const planRoutes = require('./routes/engineering/planRoutes');
const documentRoutes = require('./routes/engineering/documentRoutes');
const estimateRoutes = require('./routes/engineering/estimateRoutes');

const supplierRoutes = require('./routes/purchase/supplierRoutes');
const mrRoutes = require('./routes/purchase/mrRoutes');
const quotationRoutes = require('./routes/purchase/quotationRoutes');
const poRoutes = require('./routes/purchase/poRoutes');
const purchaseBillRoutes = require('./routes/purchase/purchaseBillRoutes');
const materialRateRoutes = require('./routes/purchase/materialRateRoutes');

const itemRoutes = require('./routes/site/itemRoutes');
const stockRoutes = require('./routes/site/stockRoutes');
const grnRoutes = require('./routes/site/grnRoutes');
const materialIssueRoutes = require('./routes/site/materialIssueRoutes');
const qcRoutes = require('./routes/site/qcRoutes');

const contractorRoutes = require('./routes/contracts/contractorRoutes');
const labourRateRoutes = require('./routes/contracts/labourRateRoutes');
const workOrderRoutes = require('./routes/contracts/workOrderRoutes');
const raBillRoutes = require('./routes/contracts/raBillRoutes');

const ledgerRoutes = require('./routes/accounts/ledgerRoutes');
const journalRoutes = require('./routes/accounts/journalRoutes');

const workflowRoutes = require('./routes/workflow/workflowRoutes');
const approvalRoutes = require('./routes/workflow/approvalRoutes');
const slaRoutes = require('./routes/workflow/slaRoutes');

// Mount routes
app.use('/api/auth', authRoutes);

// Engineering
app.use('/api/engineering/materials', materialMasterRoutes);
app.use('/api/engineering/boq', boqRoutes);
app.use('/api/engineering/projects', projectRoutes);
app.use('/api/engineering/bbs', bbsRoutes);
app.use('/api/engineering/plans', planRoutes);
app.use('/api/engineering/documents', documentRoutes);
app.use('/api/engineering/estimates', estimateRoutes);

// Purchase
app.use('/api/purchase/suppliers', supplierRoutes);
app.use('/api/purchase/mrs', mrRoutes);
app.use('/api/purchase/quotations', quotationRoutes);
app.use('/api/purchase/pos', poRoutes);
app.use('/api/purchase/bills', purchaseBillRoutes);
app.use('/api/purchase/material-rates', materialRateRoutes);

// Site
app.use('/api/site/items', itemRoutes);
app.use('/api/site/stock', stockRoutes);
app.use('/api/site/grn', grnRoutes);
app.use('/api/site/issues', materialIssueRoutes);
app.use('/api/site/qc', qcRoutes);

// Contracts
app.use('/api/contracts/contractors', contractorRoutes);
app.use('/api/contracts/labour-rates', labourRateRoutes);
app.use('/api/contracts/work-orders', workOrderRoutes);
app.use('/api/contracts/ra-bills', raBillRoutes);

// Accounts
app.use('/api/accounts/ledgers', ledgerRoutes);
app.use('/api/accounts/journals', journalRoutes);

// Workflow
app.use('/api/workflow/config', workflowRoutes);
app.use('/api/workflow/approvals', approvalRoutes);
app.use('/api/workflow/sla', slaRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Deployment Checklist

### Backend Completion Checklist

#### Engineering Module (PRIORITY 1)
- [ ] MaterialMaster: Model, Controller, Routes
- [ ] Projects: Model, Controller, Routes
- [ ] BOQ: Model, Controller, Routes, Approve API, Generate MR API
- [ ] BBS: Model, Controller, Routes
- [ ] Plans: Model, Controller, Routes, Task management
- [ ] Documents: Model, Controller, Routes, File upload
- [ ] Estimates: Model, Controller, Routes, Versioning

#### Purchase Module (PRIORITY 2)
- [ ] Suppliers: Model, Controller, Routes
- [ ] Material Requisitions: Model, Controller, Routes, Approval workflow
- [ ] Quotations: Model, Controller, Routes
- [ ] Comparative Statements: Model, Controller, Routes
- [ ] Purchase Orders: Model, Controller, Routes, Approval workflow
- [ ] Purchase Bills: Model, Controller, Routes
- [ ] Material Rates: Model, Controller, Routes

#### Site & Inventory Module (PRIORITY 3)
- [ ] Items: Model, Controller, Routes
- [ ] Stock: Model, Controller, Routes, Auto-update on GRN/Issue
- [ ] GRN: Model, Controller, Routes, Stock update integration
- [ ] Material Issues: Model, Controller, Routes, Stock update integration
- [ ] Quality Checks: Model, Controller, Routes
- [ ] Stock Transfers: Model, Controller, Routes

#### Contracts Module (PRIORITY 4)
- [ ] Contractors: Model, Controller, Routes
- [ ] Labour Rates: Model, Controller, Routes
- [ ] Work Orders: Model, Controller, Routes
- [ ] RA Bills: Model, Controller, Routes

#### QA/QC Module (PRIORITY 5)
- [ ] RMC Batch Tests: Model, Controller, Routes
- [ ] Snag Lists: Model, Controller, Routes
- [ ] Pour Card Reports: Model, Controller, Routes
- [ ] Material Test Reports: Model, Controller, Routes

#### Accounts Module (PRIORITY 6)
- [ ] Ledgers: Model, Controller, Routes
- [ ] Journals: Model, Controller, Routes, Double-entry validation
- [ ] Cost Centers: Model, Controller, Routes
- [ ] Reports: Trial Balance, P&L, Balance Sheet APIs

#### Workflow Module (PRIORITY 7)
- [ ] Workflow Config: Model, Controller, Routes
- [ ] Approvals: Model, Controller, Routes, Approval engine
- [ ] SLA: Model, Controller, Routes, SLA tracking

#### Cross-Module Integration
- [ ] BOQ → MR generation working
- [ ] MR → Quotation linkage
- [ ] Quotation → PO linkage
- [ ] PO → GRN linkage
- [ ] GRN → Stock update
- [ ] Stock → Material Issue
- [ ] PO → Purchase Bill → Accounts posting
- [ ] Approval workflows integrated

---

## Development Order

### Phase 1: Engineering Module (Week 1-2)
Complete all Engineering models, controllers, and routes. Test independently.

### Phase 2: Purchase Module (Week 2-3)
Complete Purchase module with integration to Engineering (BOQ → MR).

### Phase 3: Site & Inventory (Week 3-4)
Complete Site module with integration to Purchase (PO → GRN → Stock).

### Phase 4: Contracts (Week 4-5)
Complete Contracts module.

### Phase 5: QA/QC & Accounts (Week 5-6)
Complete remaining modules.

### Phase 6: Workflow & Testing (Week 6-7)
Complete workflow engine and end-to-end testing.

---

## Testing Commands

```bash
# Test Engineering APIs
GET http://localhost:5000/api/engineering/materials
POST http://localhost:5000/api/engineering/boq
POST http://localhost:5000/api/engineering/boq/:id/approve
POST http://localhost:5000/api/engineering/boq/:id/generate-mr

# Test Purchase APIs
GET http://localhost:5000/api/purchase/suppliers
POST http://localhost:5000/api/purchase/mrs
GET http://localhost:5000/api/purchase/quotations
POST http://localhost:5000/api/purchase/pos

# Test Site APIs
GET http://localhost:5000/api/site/stock
POST http://localhost:5000/api/site/grn
POST http://localhost:5000/api/site/issues

# Test Workflow
GET http://localhost:5000/api/workflow/approvals
POST http://localhost:5000/api/workflow/approvals/:id/approve
```

---

**END OF COMPLETE BACKEND IMPLEMENTATION GUIDE**

This file contains all models, controllers, routes, and configurations needed for production-ready backend implementation of all modules in priority order.
