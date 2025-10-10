# Backend Models for Project and Item

Add these models to your backend to support Material Requisitions.

## Project Model

Create `models/Project.js`:

```javascript
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please add a project code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please add a project manager'],
    },
    budget: {
      type: Number,
      required: [true, 'Please add a budget'],
      min: [0, 'Budget cannot be negative'],
    },
    spent: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative'],
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot be more than 100'],
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    reraId: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for manager name
projectSchema.virtual('managerName', {
  ref: 'User',
  localField: 'managerId',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('Project', projectSchema);
```

## Item Model

Create `models/Item.js`:

```javascript
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an item name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please add an item code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    sku: {
      type: String,
      trim: true,
      uppercase: true,
    },
    uom: {
      type: String,
      required: [true, 'Please add a unit of measurement'],
      enum: ['KG', 'MT', 'NOS', 'LTR', 'BAG', 'BOX', 'PIECE', 'SQM', 'SFT', 'CUM', 'CFT', 'RFT', 'RM'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Raw Material', 'Consumable', 'Equipment', 'Tools', 'Safety', 'Other'],
    },
    minQty: {
      type: Number,
      default: 0,
      min: [0, 'Minimum quantity cannot be negative'],
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Current stock cannot be negative'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
itemSchema.index({ code: 1 });
itemSchema.index({ category: 1 });
itemSchema.index({ name: 'text', code: 'text' }); // For text search

module.exports = mongoose.model('Item', itemSchema);
```

## API Controllers

### Project Controller

Create `controllers/projectController.js`:

```javascript
const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const projects = await Project.find()
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments();

    res.status(200).json({
      success: true,
      data: projects,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('managerId', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin/ProjectManager)
exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin/ProjectManager)
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
```

### Item Controller

Create `controllers/itemController.js`:

```javascript
const Item = require('../models/Item');

// @desc    Get all items
// @route   GET /api/items
// @access  Private
exports.getItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const items = await Item.find(query)
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(query);

    res.status(200).json({
      success: true,
      data: items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Private
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private (Admin/StoreManager)
exports.createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private (Admin/StoreManager)
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete (deactivate) item
// @route   DELETE /api/items/:id
// @access  Private (Admin)
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Soft delete
    item.isActive = false;
    await item.save();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
```

## API Routes

### Project Routes

Create `routes/projectRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Admin', 'ProjectManager'), createProject);

router
  .route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('Admin', 'ProjectManager'), updateProject)
  .delete(protect, authorize('Admin'), deleteProject);

module.exports = router;
```

### Item Routes

Create `routes/itemRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getItems)
  .post(protect, authorize('Admin', 'StoreManager'), createItem);

router
  .route('/:id')
  .get(protect, getItem)
  .put(protect, authorize('Admin', 'StoreManager'), updateItem)
  .delete(protect, authorize('Admin'), deleteItem);

module.exports = router;
```

## Update server.js

Add these routes to your `server.js`:

```javascript
// Import routes
const projectRoutes = require('./routes/projectRoutes');
const itemRoutes = require('./routes/itemRoutes');

// Mount routes
app.use('/api/projects', projectRoutes);
app.use('/api/items', itemRoutes);
```

## Sample Data Seeding Script

Create `scripts/seedProjectsItems.js`:

```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../models/Project');
const Item = require('../models/Item');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  try {
    // Get first admin user as project manager
    const admin = await User.findOne({ role: 'Admin' });
    
    if (!admin) {
      console.error('Please create an admin user first');
      process.exit(1);
    }

    // Clear existing data
    await Project.deleteMany();
    await Item.deleteMany();

    // Create Projects
    const projects = await Project.create([
      {
        name: 'Skyline Apartments',
        code: 'PRJ001',
        city: 'Mumbai',
        state: 'Maharashtra',
        startDate: new Date('2024-01-01'),
        managerId: admin._id,
        budget: 50000000,
        spent: 15000000,
        progress: 30,
        status: 'Active',
        description: 'Luxury apartment complex with 200 units',
      },
      {
        name: 'Green Valley Township',
        code: 'PRJ002',
        city: 'Pune',
        state: 'Maharashtra',
        startDate: new Date('2024-02-15'),
        managerId: admin._id,
        budget: 100000000,
        spent: 25000000,
        progress: 25,
        status: 'Active',
        description: 'Township project with villas and apartments',
      },
      {
        name: 'Metro Mall Complex',
        code: 'PRJ003',
        city: 'Bangalore',
        state: 'Karnataka',
        startDate: new Date('2024-03-01'),
        managerId: admin._id,
        budget: 75000000,
        spent: 0,
        progress: 0,
        status: 'Planning',
        description: 'Commercial mall with retail and entertainment',
      },
    ]);

    // Create Items
    const items = await Item.create([
      {
        name: 'Cement OPC 53 Grade',
        code: 'MAT001',
        sku: 'CEM-OPC-53',
        uom: 'BAG',
        category: 'Raw Material',
        minQty: 100,
        currentStock: 500,
        description: 'High-quality cement for construction',
      },
      {
        name: 'TMT Steel Bars 12mm',
        code: 'MAT002',
        sku: 'TMT-12MM',
        uom: 'MT',
        category: 'Raw Material',
        minQty: 10,
        currentStock: 25,
        description: 'Thermo-mechanically treated steel bars',
      },
      {
        name: 'Sand - M Sand',
        code: 'MAT003',
        sku: 'SND-MSND',
        uom: 'CUM',
        category: 'Raw Material',
        minQty: 50,
        currentStock: 150,
        description: 'Manufactured sand for construction',
      },
      {
        name: 'Concrete Mixture',
        code: 'MAT004',
        sku: 'CON-MIX',
        uom: 'CUM',
        category: 'Raw Material',
        minQty: 20,
        currentStock: 80,
        description: 'Ready-mix concrete',
      },
      {
        name: 'Safety Helmet',
        code: 'SAF001',
        sku: 'HLM-001',
        uom: 'NOS',
        category: 'Safety',
        minQty: 50,
        currentStock: 100,
        description: 'Safety helmets for workers',
      },
      {
        name: 'Safety Shoes',
        code: 'SAF002',
        sku: 'SHO-001',
        uom: 'PIECE',
        category: 'Safety',
        minQty: 50,
        currentStock: 75,
        description: 'Safety shoes with steel toe',
      },
      {
        name: 'Welding Machine',
        code: 'EQP001',
        sku: 'WLD-MAC',
        uom: 'NOS',
        category: 'Equipment',
        minQty: 2,
        currentStock: 5,
        description: 'Electric welding machine',
      },
      {
        name: 'Power Drill',
        code: 'TOL001',
        sku: 'DRL-PWR',
        uom: 'NOS',
        category: 'Tools',
        minQty: 5,
        currentStock: 10,
        description: 'Cordless power drill',
      },
    ]);

    console.log(`✅ Created ${projects.length} projects`);
    console.log(`✅ Created ${items.length} items`);
    console.log('✅ Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
```

Run the seed script:
```bash
node scripts/seedProjectsItems.js
```

Now your backend has Project and Item models, and your frontend is connected to use them!
