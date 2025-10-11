# Engineering Module - Backend Implementation Requirements

This document outlines the backend APIs that need to be developed to complete the Engineering Module.

---

## 🔴 1. Plans & Tasks API (IMMEDIATE PRIORITY)

### Current Status
- API functions exist in `engineeringApi.ts` (frontend)
- **NO ROUTES configured in server.js**
- Model likely needs creation

### Required Backend Implementation

#### A. Data Model (`models/Plan.js`)
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
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
});

const planSchema = new mongoose.Schema({
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
  progress: { type: Number, default: 0, min: 0, max: 100 },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tasks: [taskSchema],
  milestones: [{
    name: String,
    date: Date,
    completed: { type: Boolean, default: false }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: true 
});

// Auto-calculate plan progress based on tasks
planSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    const totalProgress = this.tasks.reduce((sum, task) => sum + task.progress, 0);
    this.progress = Math.round(totalProgress / this.tasks.length);
  }
  next();
});

module.exports = mongoose.model('Plan', planSchema);
```

#### B. Routes Configuration (`routes/planRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const { 
  getPlans, 
  getPlanById, 
  createPlan, 
  updatePlan, 
  deletePlan,
  addTask,
  updateTask,
  deleteTask
} = require('../controllers/planController');
const { protect } = require('../middleware/auth');

// Plan routes
router.route('/')
  .get(protect, getPlans)
  .post(protect, createPlan);

router.route('/:id')
  .get(protect, getPlanById)
  .put(protect, updatePlan)
  .delete(protect, deletePlan);

// Task routes
router.post('/:id/tasks', protect, addTask);
router.put('/:id/tasks/:taskId', protect, updateTask);
router.delete('/:id/tasks/:taskId', protect, deleteTask);

module.exports = router;
```

#### C. Controller (`controllers/planController.js`)
```javascript
const Plan = require('../models/Plan');

// @desc    Get all plans (with optional project filter)
// @route   GET /api/engineering/plans?projectId=xxx
exports.getPlans = async (req, res) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    
    const plans = await Plan.find(filter)
      .populate('projectId', 'name code')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: plans,
      total: plans.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get plan by ID
// @route   GET /api/engineering/plans/:id
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id)
      .populate('projectId', 'name code budget startDate endDate')
      .populate('assignedTo', 'name email phone')
      .populate('tasks.assignedTo', 'name email')
      .populate('createdBy', 'name');
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new plan
// @route   POST /api/engineering/plans
exports.createPlan = async (req, res) => {
  try {
    const planData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const plan = await Plan.create(planData);
    
    res.status(201).json({ 
      success: true, 
      data: plan,
      message: 'Plan created successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update plan
// @route   PUT /api/engineering/plans/:id
exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.json({ 
      success: true, 
      data: plan,
      message: 'Plan updated successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete plan
// @route   DELETE /api/engineering/plans/:id
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Plan deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add task to plan
// @route   POST /api/engineering/plans/:id/tasks
exports.addTask = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    plan.tasks.push(req.body);
    await plan.save();
    
    res.status(201).json({ 
      success: true, 
      data: plan,
      message: 'Task added successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update task in plan
// @route   PUT /api/engineering/plans/:id/tasks/:taskId
exports.updateTask = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    const task = plan.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    Object.assign(task, req.body);
    await plan.save();
    
    res.json({ 
      success: true, 
      data: plan,
      message: 'Task updated successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete task from plan
// @route   DELETE /api/engineering/plans/:id/tasks/:taskId
exports.deleteTask = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    
    plan.tasks.id(req.params.taskId).remove();
    await plan.save();
    
    res.json({ 
      success: true, 
      data: plan,
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

#### D. Add to `server.js`
```javascript
// Add this import at the top
const planRoutes = require('./routes/planRoutes');

// Add this route configuration
app.use('/api/engineering/plans', planRoutes);
```

---

## 🔴 2. BBS (Bar Bending Schedule) API

### Data Model (`models/BBS.js`)
```javascript
const mongoose = require('mongoose');

const bbsItemSchema = new mongoose.Schema({
  markNo: { type: String, required: true },
  barDiameter: { type: Number, required: true }, // in mm
  type: { type: String, required: true }, // e.g., 'Main', 'Stirrup', 'Distribution'
  shape: { type: String, required: true }, // e.g., 'Straight', 'L', 'U', 'Circular'
  length: { type: Number, required: true }, // in meters
  quantity: { type: Number, required: true },
  totalLength: { type: Number }, // auto-calculated: length * quantity
  weight: { type: Number }, // auto-calculated based on diameter
  totalWeight: { type: Number }, // auto-calculated
  location: String, // e.g., 'Column C1', 'Beam B2'
  remarks: String
});

// Auto-calculate before save
bbsItemSchema.pre('save', function(next) {
  this.totalLength = this.length * this.quantity;
  
  // Weight per meter for steel (kg/m) = (D^2 / 162) where D is diameter in mm
  const weightPerMeter = (this.barDiameter * this.barDiameter) / 162;
  this.weight = weightPerMeter * this.length;
  this.totalWeight = this.weight * this.quantity;
  
  next();
});

const bbsSchema = new mongoose.Schema({
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
  totalWeight: { type: Number, default: 0 }, // sum of all items
  unit: { type: String, default: 'kg' },
  status: { 
    type: String, 
    enum: ['Draft', 'Approved', 'Issued'], 
    default: 'Draft' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: true 
});

// Calculate total weight
bbsSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalWeight = this.items.reduce((sum, item) => sum + (item.totalWeight || 0), 0);
  }
  next();
});

module.exports = mongoose.model('BBS', bbsSchema);
```

### API Endpoints Required
```
GET    /api/engineering/bbs                    - List all BBS
GET    /api/engineering/bbs/:id                - Get BBS by ID
GET    /api/engineering/bbs?projectId=xxx      - Get BBS by project
POST   /api/engineering/bbs                    - Create new BBS
PUT    /api/engineering/bbs/:id                - Update BBS
DELETE /api/engineering/bbs/:id                - Delete BBS
POST   /api/engineering/bbs/:id/approve        - Approve BBS
POST   /api/engineering/bbs/:id/items          - Add item to BBS
PUT    /api/engineering/bbs/:id/items/:itemId  - Update BBS item
DELETE /api/engineering/bbs/:id/items/:itemId  - Delete BBS item
GET    /api/engineering/bbs/:id/export         - Export BBS to PDF/Excel
```

### Key Features to Implement
1. Automatic weight calculations based on bar diameter
2. Support for different bar shapes (Straight, L, U, Circular)
3. Approval workflow
4. Export to PDF with standard BBS format
5. Material procurement integration (link to Purchase Module)

---

## 🟡 3. Drawing Change Management API

### Data Model Updates (`models/Document.js` - extend existing)
```javascript
// Add these fields to existing Document model
{
  // ... existing fields ...
  
  // Drawing-specific fields
  drawingNumber: String,
  revision: { type: String, default: 'A' },
  parentDocumentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document' 
  }, // Reference to original drawing
  
  // Change management
  changeRequest: {
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestDate: Date,
    reason: String,
    description: String,
    priority: { 
      type: String, 
      enum: ['Low', 'Medium', 'High', 'Critical'], 
      default: 'Medium' 
    }
  },
  
  approvalWorkflow: {
    status: { 
      type: String, 
      enum: ['Draft', 'PendingReview', 'Approved', 'Rejected'], 
      default: 'Draft' 
    },
    reviewers: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'] 
      },
      comments: String,
      reviewedAt: Date
    }],
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: Date,
    rejectionReason: String
  }
}
```

### API Endpoints Required
```
POST   /api/engineering/documents/:id/request-change    - Request drawing change
POST   /api/engineering/documents/:id/submit-review     - Submit for review
POST   /api/engineering/documents/:id/review            - Review drawing (approve/reject)
GET    /api/engineering/documents/:id/history           - Get revision history
GET    /api/engineering/documents/compare/:id1/:id2     - Compare two revisions
```

---

## 🟡 4. RERA & Compliance Management API

### Data Model (`models/Compliance.js`)
```javascript
const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: [
      'RERA', 
      'Building Permit', 
      'Environmental Clearance', 
      'Fire NOC', 
      'Occupancy Certificate',
      'Other'
    ]
  },
  documentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document' 
  }, // Link to uploaded document
  certificateNumber: String,
  issuingAuthority: String,
  issueDate: Date,
  expiryDate: Date,
  status: { 
    type: String, 
    enum: ['Valid', 'Expiring', 'Expired', 'Pending', 'Rejected'], 
    default: 'Pending' 
  },
  renewalRequired: { type: Boolean, default: false },
  renewalDate: Date,
  notificationSent: { type: Boolean, default: false },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { 
  timestamps: true 
});

// Auto-update status based on expiry date
complianceSchema.pre('save', function(next) {
  if (this.expiryDate) {
    const today = new Date();
    const daysToExpiry = Math.ceil((this.expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) {
      this.status = 'Expired';
    } else if (daysToExpiry <= 30) {
      this.status = 'Expiring';
    } else if (this.status !== 'Rejected') {
      this.status = 'Valid';
    }
  }
  next();
});

module.exports = mongoose.model('Compliance', complianceSchema);
```

### API Endpoints Required
```
GET    /api/engineering/compliance                     - List all compliance records
GET    /api/engineering/compliance/:id                 - Get compliance by ID
GET    /api/engineering/compliance?projectId=xxx       - Get by project
GET    /api/engineering/compliance/expiring            - Get expiring documents
POST   /api/engineering/compliance                     - Create compliance record
PUT    /api/engineering/compliance/:id                 - Update compliance record
DELETE /api/engineering/compliance/:id                 - Delete compliance record
POST   /api/engineering/compliance/:id/renew           - Mark for renewal
GET    /api/engineering/compliance/dashboard/:projectId - Compliance dashboard data
```

---

## 📝 Testing Checklist

### For Plans API
- [ ] Create plan with tasks
- [ ] Update plan progress auto-calculation
- [ ] Add/update/delete tasks
- [ ] Filter plans by project
- [ ] Populate related fields (project, users)

### For BBS API
- [ ] Create BBS with items
- [ ] Auto-calculate weights correctly
- [ ] Approve workflow
- [ ] Export to PDF
- [ ] Filter by structure type

### For Drawing Changes
- [ ] Request change with reason
- [ ] Multi-reviewer workflow
- [ ] Revision tracking
- [ ] Comparison feature

### For Compliance
- [ ] Auto-status updates based on dates
- [ ] Expiry notifications (30 days before)
- [ ] Dashboard with all compliance statuses
- [ ] Renewal workflow

---

## 🚀 Implementation Priority

1. **Immediate**: Plans & Tasks (most requested feature)
2. **High**: BBS (critical for material procurement)
3. **Medium**: Drawing Change Management (important but can use basic documents for now)
4. **Low**: RERA Compliance (can be tracked manually initially)
