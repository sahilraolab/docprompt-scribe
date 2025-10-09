# Purchase Module - Complete Backend Documentation
## Node.js + MongoDB Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Initial Setup - Creating First Admin User](#initial-setup---creating-first-admin-user)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
   - [Authentication Routes](#authentication-routes)
   - [User Management Routes](#user-management-routes)
   - [Purchase Module Routes](#purchase-module-routes)
6. [Business Logic & Validation](#business-logic--validation)
7. [Integration Points](#integration-points)
8. [Security & Authorization](#security--authorization)
9. [File Structure](#file-structure)
10. [Testing Strategy](#testing-strategy)
11. [Environment Variables](#environment-variables)

---

## Overview

The Purchase Module manages the complete procurement lifecycle from material requisitions to purchase orders, bills, and supplier management. This module integrates with Engineering (projects), Site (inventory/GRN), Accounts (posting entries), and Workflow (approvals) modules.

### Key Features
- Supplier Registration & Management
- Material Requisitions (MR) with approvals
- Supplier Quotations Management
- Comparative Statement Analysis
- Purchase Order (PO) Generation & Tracking
- Purchase Bills & Payment Tracking
- Material Rate Management
- GST & Tax Calculations
- Multi-level Approval Workflows

---

## Technology Stack

```javascript
{
  "backend": "Node.js with Express.js",
  "database": "MongoDB with Mongoose ODM",
  "authentication": "JWT (JSON Web Tokens)",
  "validation": "Joi or Zod",
  "fileUploads": "Multer + AWS S3/Local Storage",
  "pdfGeneration": "PDFKit or Puppeteer",
  "email": "Nodemailer",
  "logging": "Winston",
  "testing": "Jest + Supertest"
}
```

### Required NPM Packages
```bash
npm install express mongoose dotenv bcryptjs jsonwebtoken
npm install joi express-validator multer
npm install pdfkit nodemailer winston
npm install cors helmet morgan compression

# Dev Dependencies
npm install --save-dev nodemon jest supertest
```

---

## Database Schema

### 1. Users Collection (Authentication & Authorization)

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email address'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{10}$/.test(v);
      },
      message: 'Invalid phone number'
    }
  },
  department: {
    type: String,
    enum: ['Engineering', 'Purchase', 'Site', 'Accounts', 'Contracts', 'Admin'],
  },
  designation: String,
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastLogin: Date,
  // Avatar/profile picture
  avatar: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ active: 1 });

module.exports = mongoose.model('User', userSchema);
```

### 2. User Roles Collection (RBAC)

```javascript
// models/UserRole.js
const mongoose = require('mongoose');

// Define roles enum
const roleEnum = ['Admin', 'PurchaseManager', 'PurchaseOfficer', 'ProjectManager', 
                  'SiteManager', 'AccountsManager', 'ContractsManager', 'Viewer'];

const userRoleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: roleEnum,
    required: true,
  },
  permissions: [{
    module: {
      type: String,
      enum: ['Purchase', 'Engineering', 'Site', 'Accounts', 'Contracts', 'Workflow', 'Admin'],
      required: true,
    },
    actions: [{
      type: String,
      enum: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject', 'Issue', 'Close'],
    }],
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Unique constraint: one user can have multiple roles
userRoleSchema.index({ userId: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('UserRole', userRoleSchema);
```

### 3. Suppliers Collection

```javascript
// models/Supplier.js
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    // Auto-generated: SUPP001, SUPP002, etc.
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: 'text',
  },
  contact: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: 'Invalid phone number'
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email address'
    }
  },
  gst: {
    type: String,
    uppercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Invalid GST number'
    }
  },
  pan: {
    type: String,
    uppercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'Invalid PAN number'
    }
  },
  address: String,
  city: {
    type: String,
    index: true,
  },
  state: {
    type: String,
    index: true,
  },
  pincode: String,
  bankName: String,
  accountNo: String,
  ifsc: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  paymentTerms: String,
  active: {
    type: Boolean,
    default: true,
    index: true,
  },
  metadata: {
    totalPOs: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    lastOrderDate: Date,
    averageDeliveryDays: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
supplierSchema.index({ name: 'text', contact: 'text' });
supplierSchema.index({ city: 1, state: 1 });
supplierSchema.index({ active: 1, rating: -1 });

module.exports = mongoose.model('Supplier', supplierSchema);
```

### 2. Material Requisitions (MR) Collection

```javascript
// models/MaterialRequisition.js
const mongoose = require('mongoose');

const mrItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item', // Reference to Site Module's Item
    required: true,
  },
  itemName: String, // Denormalized for performance
  itemCode: String,
  description: String,
  qty: {
    type: Number,
    required: true,
    min: 0,
  },
  uom: {
    type: String,
    required: true,
  },
  requiredBy: {
    type: Date,
    required: true,
  },
  estimatedRate: Number,
  estimatedAmount: Number,
  remarks: String,
});

const approverSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: String,
  level: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  approvedAt: Date,
  remarks: String,
});

const materialRequisitionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    // Format: MR2024-001
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Reference to Engineering Module
    required: true,
    index: true,
  },
  projectName: String, // Denormalized
  projectCode: String,
  items: [mrItemSchema],
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Closed'],
    default: 'Draft',
    index: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  requestedByName: String,
  requestedByEmail: String,
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Partially Approved'],
    default: 'Pending',
  },
  approvalLevel: {
    type: Number,
    default: 0,
  },
  approvers: [approverSchema],
  remarks: String,
  attachments: [String], // File paths/URLs
  // Workflow tracking
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkflowConfig',
  },
  submittedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  closedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
materialRequisitionSchema.index({ code: 1 });
materialRequisitionSchema.index({ projectId: 1, status: 1 });
materialRequisitionSchema.index({ requestedBy: 1, status: 1 });
materialRequisitionSchema.index({ status: 1, createdAt: -1 });
materialRequisitionSchema.index({ 'approvers.userId': 1, 'approvers.status': 1 });

module.exports = mongoose.model('MaterialRequisition', materialRequisitionSchema);
```

### 3. Quotations Collection

```javascript
// models/Quotation.js
const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  mrItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  description: String,
  qty: {
    type: Number,
    required: true,
    min: 0,
  },
  uom: String,
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  taxPct: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  amount: {
    type: Number,
    required: true,
  },
  taxAmount: Number,
  totalAmount: Number,
  specifications: String,
  brand: String,
  hsn: String,
});

const quotationSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    // Format: QT2024-001
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true,
  },
  supplierName: String,
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequisition',
    required: true,
    index: true,
  },
  mrCode: String,
  quotationNo: String, // Supplier's quotation number
  quotationDate: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  items: [quotationItemSchema],
  notes: String,
  terms: String,
  deliveryTerms: String,
  paymentTerms: String,
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Accepted', 'Rejected', 'Pending'],
    default: 'Active',
    index: true,
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    default: 0,
  },
  attachments: [String],
  acceptedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Pre-save middleware to calculate totals
quotationSchema.pre('save', function(next) {
  this.totalAmount = 0;
  this.taxAmount = 0;
  
  this.items.forEach(item => {
    item.amount = item.qty * item.rate;
    item.taxAmount = (item.amount * item.taxPct) / 100;
    item.totalAmount = item.amount + item.taxAmount;
    
    this.totalAmount += item.amount;
    this.taxAmount += item.taxAmount;
  });
  
  this.grandTotal = this.totalAmount + this.taxAmount;
  next();
});

// Indexes
quotationSchema.index({ supplierId: 1, mrId: 1 });
quotationSchema.index({ status: 1, expiresAt: 1 });
quotationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Quotation', quotationSchema);
```

### 4. Comparative Statements Collection

```javascript
// models/ComparativeStatement.js
const mongoose = require('mongoose');

const comparativeQuotationSchema = new mongoose.Schema({
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  supplierName: String,
  totalAmount: Number,
  taxAmount: Number,
  grandTotal: Number,
  deliveryTerms: String,
  paymentTerms: String,
  items: [{
    description: String,
    qty: Number,
    rate: Number,
    amount: Number,
  }],
  ranking: Number, // 1 = Best, 2 = Second best, etc.
  remarks: String,
});

const comparativeStatementSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    // Format: CS2024-001
  },
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequisition',
    required: true,
    index: true,
  },
  mrCode: String,
  quotations: [comparativeQuotationSchema],
  selectedSupplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
  },
  selectedQuotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
  },
  analysis: String, // Detailed comparison analysis
  comparison: {
    lowestPrice: Number,
    highestPrice: Number,
    averagePrice: Number,
    recommendedSupplier: String,
    criteria: [String], // ['Price', 'Quality', 'Delivery', 'Past Performance']
  },
  approvers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: String,
    approvedAt: Date,
    remarks: String,
  }],
  attachments: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
comparativeStatementSchema.index({ mrId: 1 });
comparativeStatementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ComparativeStatement', comparativeStatementSchema);
```

### 5. Purchase Orders Collection

```javascript
// models/PurchaseOrder.js
const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  description: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 0,
  },
  uom: String,
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  taxPct: {
    type: Number,
    default: 0,
  },
  amount: Number,
  taxAmount: Number,
  totalAmount: Number,
  hsn: String,
  // GRN tracking
  receivedQty: {
    type: Number,
    default: 0,
  },
  pendingQty: Number,
});

const purchaseOrderSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    // Format: PO2024-001
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true,
  },
  supplierName: String,
  supplierContact: String,
  supplierAddress: String,
  supplierGST: String,
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  projectName: String,
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaterialRequisition',
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
  },
  items: [poItemSchema],
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Issued', 'Partially Received', 'Received', 'Closed', 'Cancelled'],
    default: 'Draft',
    index: true,
  },
  total: Number,
  taxTotal: Number,
  grandTotal: Number,
  deliveryDate: {
    type: Date,
    required: true,
  },
  deliveryAddress: String,
  terms: String,
  paymentTerms: String,
  freight: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  approvers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    level: Number,
    status: String,
    approvedAt: Date,
    remarks: String,
  }],
  // Status dates
  issuedAt: Date,
  approvedAt: Date,
  rejectedAt: Date,
  closedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  // Attachments
  attachments: [String],
  // Integration
  accountsPosted: {
    type: Boolean,
    default: false,
  },
  accountsPostingDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Pre-save middleware
purchaseOrderSchema.pre('save', function(next) {
  this.total = 0;
  this.taxTotal = 0;
  
  this.items.forEach(item => {
    item.amount = item.qty * item.rate;
    item.taxAmount = (item.amount * item.taxPct) / 100;
    item.totalAmount = item.amount + item.taxAmount;
    item.pendingQty = item.qty - (item.receivedQty || 0);
    
    this.total += item.amount;
    this.taxTotal += item.taxAmount;
  });
  
  this.grandTotal = this.total + this.taxTotal + (this.freight || 0) - (this.discount || 0);
  next();
});

// Indexes
purchaseOrderSchema.index({ code: 1 });
purchaseOrderSchema.index({ supplierId: 1, status: 1 });
purchaseOrderSchema.index({ projectId: 1, status: 1 });
purchaseOrderSchema.index({ status: 1, createdAt: -1 });
purchaseOrderSchema.index({ 'approvers.userId': 1, 'approvers.status': 1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
```

### 6. Purchase Bills Collection

```javascript
// models/PurchaseBill.js
const mongoose = require('mongoose');

const purchaseBillSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    // Format: PB2024-001
  },
  poId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true,
    index: true,
  },
  poCode: String,
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true,
  },
  supplierName: String,
  invoiceNo: {
    type: String,
    required: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Paid', 'Partially Paid', 'Overdue'],
    default: 'Pending',
    index: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  balanceAmount: {
    type: Number,
    default: 0,
  },
  payments: [{
    amount: Number,
    paymentDate: Date,
    paymentMode: String, // Bank Transfer, Cheque, Cash, etc.
    referenceNo: String,
    remarks: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  tdsAmount: {
    type: Number,
    default: 0,
  },
  tdsPercent: {
    type: Number,
    default: 0,
  },
  // Accounts integration
  accountsPosted: {
    type: Boolean,
    default: false,
  },
  accountsPostingDate: Date,
  ledgerEntries: [{
    ledgerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ledger',
    },
    amount: Number,
    type: String, // Debit/Credit
  }],
  attachments: [String], // Invoice PDFs, supporting documents
  remarks: String,
  approvalStatus: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Pre-save middleware
purchaseBillSchema.pre('save', function(next) {
  this.balanceAmount = this.total - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0 && this.status !== 'Draft' && this.status !== 'Rejected') {
    if (new Date() > this.dueDate) {
      this.status = 'Overdue';
    }
  } else if (this.paidAmount > 0 && this.paidAmount < this.total) {
    this.status = 'Partially Paid';
  } else if (this.paidAmount >= this.total) {
    this.status = 'Paid';
  }
  
  next();
});

// Indexes
purchaseBillSchema.index({ code: 1 });
purchaseBillSchema.index({ poId: 1 });
purchaseBillSchema.index({ supplierId: 1, status: 1 });
purchaseBillSchema.index({ status: 1, dueDate: 1 });
purchaseBillSchema.index({ invoiceNo: 1 });

module.exports = mongoose.model('PurchaseBill', purchaseBillSchema);
```

### 7. Material Rates Collection

```javascript
// models/MaterialRate.js
const mongoose = require('mongoose');

const materialRateSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
    index: true,
  },
  itemName: String,
  itemCode: String,
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true,
  },
  supplierName: String,
  rate: {
    type: Number,
    required: true,
    min: 0,
  },
  uom: {
    type: String,
    required: true,
  },
  taxPct: {
    type: Number,
    default: 0,
  },
  effectiveFrom: {
    type: Date,
    required: true,
    index: true,
  },
  effectiveTo: {
    type: Date,
    index: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Expired'],
    default: 'Active',
    index: true,
  },
  minOrderQty: {
    type: Number,
    default: 0,
  },
  leadTimeDays: {
    type: Number,
    default: 0,
  },
  brand: String,
  specifications: String,
  remarks: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
materialRateSchema.index({ itemId: 1, supplierId: 1, effectiveFrom: -1 });
materialRateSchema.index({ status: 1, effectiveFrom: 1, effectiveTo: 1 });

module.exports = mongoose.model('MaterialRate', materialRateSchema);
```

---

## API Endpoints

### Base Configuration

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/mrs', require('./routes/material-requisitions'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api/comparative-statements', require('./routes/comparative-statements'));
app.use('/api/pos', require('./routes/purchase-orders'));
app.use('/api/purchase-bills', require('./routes/purchase-bills'));
app.use('/api/material-rates', require('./routes/material-rates'));
app.use('/api/purchase/dashboard', require('./routes/purchase-dashboard'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err : {}
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Authentication Routes

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const auth = require('../middleware/auth');

// POST /api/auth/register - Register new user (Admin only)
router.post('/register', auth, async (req, res) => {
  try {
    // Only admins can create users
    const adminRole = await UserRole.findOne({ 
      userId: req.userId, 
      role: 'Admin' 
    });
    
    if (!adminRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only administrators can create users'
        }
      });
    }
    
    const { name, email, password, phone, department, designation, role, permissions } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }
    
    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      department,
      designation,
      createdBy: req.userId,
    });
    
    await user.save();
    
    // Assign role and permissions
    if (role) {
      const userRole = new UserRole({
        userId: user._id,
        role,
        permissions: permissions || [],
        createdBy: req.userId,
      });
      await userRole.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email, active: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }
    
    // Get user roles and permissions
    const userRoles = await UserRole.find({ userId: user._id });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: user.department,
          designation: user.designation,
          avatar: user.avatar,
          roles: userRoles.map(r => ({
            role: r.role,
            permissions: r.permissions
          }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const userRoles = await UserRole.find({ userId: req.userId });
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          department: user.department,
          designation: user.designation,
          avatar: user.avatar,
          roles: userRoles.map(r => ({
            role: r.role,
            permissions: r.permissions
          }))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/auth/change-password - Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.userId);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
```

### Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserRole = require('../models/UserRole');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.active) {
      throw new Error('User not found or inactive');
    }
    
    // Get user roles and permissions
    const userRoles = await UserRole.find({ userId: user._id });
    
    req.user = user;
    req.userId = user._id;
    req.userRoles = userRoles;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
};

module.exports = auth;
```

### Permission Middleware

```javascript
// middleware/permissions.js
const UserRole = require('../models/UserRole');

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const userRoles = req.userRoles || await UserRole.find({ userId: req.userId });
      
      // Admin has all permissions
      const isAdmin = userRoles.some(r => r.role === 'Admin');
      if (isAdmin) {
        return next();
      }
      
      // Check if user has required permission
      const hasPermission = userRoles.some(role => 
        role.permissions.some(
          p => p.module === module && p.actions.includes(action)
        )
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to perform this action'
          }
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message
        }
      });
    }
  };
};

module.exports = checkPermission;
```

### Suppliers Routes

```javascript
// routes/suppliers.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/permissions');
const Supplier = require('../models/Supplier');
const { generateCode } = require('../utils/codeGenerator');

// GET /api/suppliers - Get all suppliers
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      active,
      city,
      state,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    if (city) query.city = city;
    if (state) query.state = state;
    
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const [suppliers, total] = await Promise.all([
      Supplier.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Supplier.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: suppliers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// GET /api/suppliers/:id - Get supplier by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/suppliers - Create supplier
router.post('/', auth, checkPermission('Purchase', 'Create'), async (req, res) => {
  try {
    const code = await generateCode('SUPP', Supplier);
    
    const supplier = new Supplier({
      ...req.body,
      code,
      createdBy: req.userId,
    });
    
    await supplier.save();
    
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE',
          message: 'Supplier already exists'
        }
      });
    }
    
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
});

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', auth, checkPermission('Purchase', 'Update'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.userId,
      },
      { new: true, runValidators: true }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
});

// DELETE /api/suppliers/:id - Delete supplier
router.delete('/:id', auth, checkPermission('Purchase', 'Delete'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier not found'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;
```

### Material Requisitions Routes

```javascript
// routes/material-requisitions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/permissions');
const MaterialRequisition = require('../models/MaterialRequisition');
const { generateCode } = require('../utils/codeGenerator');
const { initiateWorkflow } = require('../utils/workflow');

// GET /api/mrs - Get all MRs
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      projectId,
      status,
      requestedBy,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (requestedBy) query.requestedBy = requestedBy;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const [mrs, total] = await Promise.all([
      MaterialRequisition.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('projectId', 'name code')
        .populate('requestedBy', 'name email')
        .lean(),
      MaterialRequisition.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: mrs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/mrs - Create MR
router.post('/', auth, checkPermission('Purchase', 'Create'), async (req, res) => {
  try {
    const code = await generateCode('MR', MaterialRequisition);
    
    const mr = new MaterialRequisition({
      ...req.body,
      code,
      requestedBy: req.userId,
      createdBy: req.userId,
    });
    
    await mr.save();
    
    res.status(201).json({
      success: true,
      message: 'Material requisition created successfully',
      data: mr
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/mrs/:id/submit - Submit MR for approval
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const mr = await MaterialRequisition.findById(req.params.id);
    
    if (!mr) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'MR not found'
        }
      });
    }
    
    if (mr.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'MR already submitted'
        }
      });
    }
    
    // Initiate approval workflow
    const workflow = await initiateWorkflow('MR', mr._id, mr.grandTotal, req.userId);
    
    mr.status = 'Pending';
    mr.approvalStatus = 'Pending';
    mr.approvers = workflow.approvers;
    mr.workflowId = workflow._id;
    mr.submittedAt = new Date();
    
    await mr.save();
    
    // Send notifications to approvers
    // await sendApprovalNotifications(workflow.approvers, mr);
    
    res.json({
      success: true,
      message: 'MR submitted for approval',
      data: mr
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/mrs/:id/approve - Approve/Reject MR
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const { action, remarks } = req.body;
    const mr = await MaterialRequisition.findById(req.params.id);
    
    if (!mr) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'MR not found'
        }
      });
    }
    
    // Find approver in the list
    const approverIndex = mr.approvers.findIndex(
      a => a.userId.toString() === req.userId.toString() && a.status === 'Pending'
    );
    
    if (approverIndex === -1) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized to approve this MR'
        }
      });
    }
    
    // Update approver status
    mr.approvers[approverIndex].status = action === 'approve' ? 'Approved' : 'Rejected';
    mr.approvers[approverIndex].approvedAt = new Date();
    mr.approvers[approverIndex].remarks = remarks;
    
    if (action === 'reject') {
      mr.status = 'Rejected';
      mr.approvalStatus = 'Rejected';
      mr.rejectedAt = new Date();
    } else {
      // Check if all approvers have approved
      const allApproved = mr.approvers.every(a => a.status === 'Approved');
      
      if (allApproved) {
        mr.status = 'Approved';
        mr.approvalStatus = 'Approved';
        mr.approvedAt = new Date();
      } else {
        mr.approvalLevel += 1;
      }
    }
    
    await mr.save();
    
    res.json({
      success: true,
      message: `MR ${action}d successfully`,
      data: mr
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;
```

### Purchase Orders Routes

```javascript
// routes/purchase-orders.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkPermission = require('../middleware/permissions');
const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const { generateCode } = require('../utils/codeGenerator');
const { generatePOPDF } = require('../utils/pdfGenerator');
const { postToAccounts } = require('../utils/accountsIntegration');

// GET /api/pos - Get all POs
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      projectId,
      supplierId,
      status,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (projectId) query.projectId = projectId;
    if (supplierId) query.supplierId = supplierId;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const [pos, total] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('projectId', 'name code')
        .populate('supplierId', 'name code contact')
        .lean(),
      PurchaseOrder.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: pos,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// GET /api/pos/:id - Get PO by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id)
      .populate('projectId')
      .populate('supplierId')
      .populate('mrId')
      .populate('quotationId');
    
    if (!po) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase order not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: po
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/pos - Create PO
router.post('/', auth, checkPermission('Purchase', 'Create'), async (req, res) => {
  try {
    const code = await generateCode('PO', PurchaseOrder);
    
    // Get supplier details
    const supplier = await Supplier.findById(req.body.supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Supplier not found'
        }
      });
    }
    
    const po = new PurchaseOrder({
      ...req.body,
      code,
      supplierName: supplier.name,
      supplierContact: supplier.phone,
      supplierAddress: supplier.address,
      supplierGST: supplier.gst,
      createdBy: req.userId,
    });
    
    await po.save();
    
    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: po
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/pos/:id/issue - Issue PO to supplier
router.post('/:id/issue', auth, checkPermission('Purchase', 'Issue'), async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase order not found'
        }
      });
    }
    
    if (po.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only approved POs can be issued'
        }
      });
    }
    
    po.status = 'Issued';
    po.issuedAt = new Date();
    await po.save();
    
    // Generate PDF
    const pdfPath = await generatePOPDF(po);
    
    // Send email to supplier
    // await sendPOEmail(po, pdfPath);
    
    // Update supplier metadata
    await Supplier.findByIdAndUpdate(po.supplierId, {
      $inc: {
        'metadata.totalPOs': 1,
        'metadata.totalAmount': po.grandTotal
      },
      'metadata.lastOrderDate': new Date()
    });
    
    res.json({
      success: true,
      message: 'Purchase order issued successfully',
      data: po,
      pdfPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

// POST /api/pos/:id/close - Close PO
router.post('/:id/close', auth, checkPermission('Purchase', 'Close'), async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Purchase order not found'
        }
      });
    }
    
    po.status = 'Closed';
    po.closedAt = new Date();
    await po.save();
    
    res.json({
      success: true,
      message: 'Purchase order closed successfully',
      data: po
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
});

module.exports = router;
```

---

## Business Logic & Validation

### Code Generation Utility

```javascript
// utils/codeGenerator.js
async function generateCode(prefix, Model) {
  const year = new Date().getFullYear();
  const yearStr = year.toString();
  
  // Find the latest code with this prefix and year
  const latestDoc = await Model.findOne({
    code: new RegExp(`^${prefix}${yearStr}-`)
  }).sort({ code: -1 }).select('code');
  
  let sequence = 1;
  
  if (latestDoc) {
    const parts = latestDoc.code.split('-');
    if (parts.length === 2) {
      sequence = parseInt(parts[1]) + 1;
    }
  }
  
  // Format: PREFIX2024-001
  return `${prefix}${yearStr}-${String(sequence).padStart(3, '0')}`;
}

module.exports = { generateCode };
```

### Workflow Integration

```javascript
// utils/workflow.js
const WorkflowConfig = require('../models/WorkflowConfig');

async function initiateWorkflow(entityType, entityId, amount, initiatedBy) {
  // Find applicable workflow based on amount thresholds
  const workflow = await WorkflowConfig.findOne({
    entityType,
    active: true,
    minAmount: { $lte: amount },
    $or: [
      { maxAmount: { $gte: amount } },
      { maxAmount: null }
    ]
  }).populate('approvers.userId');
  
  if (!workflow) {
    throw new Error('No workflow configuration found');
  }
  
  const approvers = workflow.approvers.map((approver, index) => ({
    userId: approver.userId._id,
    userName: approver.userId.name,
    level: index + 1,
    status: 'Pending',
    remarks: ''
  }));
  
  return {
    _id: workflow._id,
    approvers,
    levels: workflow.approvers.length
  };
}

module.exports = { initiateWorkflow };
```

### Accounts Integration

```javascript
// utils/accountsIntegration.js
const JournalEntry = require('../models/JournalEntry');

async function postPurchaseToAccounts(po) {
  // Create journal entry for purchase
  const journalEntry = new JournalEntry({
    code: await generateCode('JE', JournalEntry),
    type: 'Purchase',
    referenceType: 'PurchaseOrder',
    referenceId: po._id,
    referenceCode: po.code,
    date: new Date(),
    entries: [
      {
        ledgerId: 'PURCHASE_LEDGER_ID', // Purchase A/c Dr
        type: 'Debit',
        amount: po.total
      },
      {
        ledgerId: 'GST_INPUT_LEDGER_ID', // GST Input A/c Dr
        type: 'Debit',
        amount: po.taxTotal
      },
      {
        ledgerId: po.supplierId, // Supplier A/c Cr
        type: 'Credit',
        amount: po.grandTotal
      }
    ],
    narration: `Purchase from ${po.supplierName} - ${po.code}`,
    createdBy: po.createdBy
  });
  
  await journalEntry.save();
  
  return journalEntry;
}

async function postPaymentToAccounts(bill, payment) {
  const journalEntry = new JournalEntry({
    code: await generateCode('JE', JournalEntry),
    type: 'Payment',
    referenceType: 'PurchaseBill',
    referenceId: bill._id,
    referenceCode: bill.code,
    date: payment.paymentDate,
    entries: [
      {
        ledgerId: bill.supplierId, // Supplier A/c Dr
        type: 'Debit',
        amount: payment.amount
      },
      {
        ledgerId: 'BANK_LEDGER_ID', // Bank A/c Cr
        type: 'Credit',
        amount: payment.amount
      }
    ],
    narration: `Payment to ${bill.supplierName} - ${bill.invoiceNo}`,
    createdBy: payment.createdBy
  });
  
  await journalEntry.save();
  
  return journalEntry;
}

module.exports = {
  postPurchaseToAccounts,
  postPaymentToAccounts
};
```

---

## Integration Points

### 1. Integration with Engineering Module

```javascript
// When creating MR, validate project exists
const Project = require('../models/Project');
const project = await Project.findById(req.body.projectId);
if (!project) {
  throw new Error('Project not found');
}

// When creating PO, update project budget utilization
await Project.findByIdAndUpdate(po.projectId, {
  $inc: {
    'budget.utilized': po.grandTotal,
    'budget.committed': po.grandTotal
  }
});
```

### 2. Integration with Site Module (Inventory/GRN)

```javascript
// When GRN is created against PO
router.post('/api/grn', async (req, res) => {
  const { poId, items } = req.body;
  
  const po = await PurchaseOrder.findById(poId);
  
  // Update received quantities in PO
  items.forEach(grnItem => {
    const poItem = po.items.id(grnItem.poItemId);
    if (poItem) {
      poItem.receivedQty += grnItem.qty;
    }
  });
  
  // Check if all items received
  const allReceived = po.items.every(item => item.receivedQty >= item.qty);
  
  if (allReceived) {
    po.status = 'Received';
  } else {
    po.status = 'Partially Received';
  }
  
  await po.save();
  
  // Create stock entries in inventory
  // ...
});
```

### 3. Integration with Accounts Module

```javascript
// Auto-post purchase entries
router.post('/api/pos/:id/post-to-accounts', auth, async (req, res) => {
  const po = await PurchaseOrder.findById(req.params.id);
  
  if (po.accountsPosted) {
    return res.status(400).json({
      success: false,
      error: { message: 'Already posted to accounts' }
    });
  }
  
  const journalEntry = await postPurchaseToAccounts(po);
  
  po.accountsPosted = true;
  po.accountsPostingDate = new Date();
  await po.save();
  
  res.json({
    success: true,
    message: 'Posted to accounts successfully',
    journalEntry
  });
});
```

### 4. Integration with Workflow Module

```javascript
// Approval workflow triggers
const { sendNotification } = require('../utils/notifications');

async function notifyApprovers(entity, approvers) {
  for (const approver of approvers) {
    if (approver.status === 'Pending') {
      await sendNotification({
        userId: approver.userId,
        type: 'Approval Required',
        title: `${entity.code} requires your approval`,
        message: `Please review and approve ${entity.constructor.modelName}`,
        link: `/workflow/approvals/${entity._id}`,
        priority: 'High'
      });
      
      // Send email notification
      // await sendEmail(approver.email, 'Approval Required', emailTemplate);
    }
  }
}
```

---

## Security & Authorization

### Role-Based Access Control (RBAC)

```javascript
// models/User.js - User roles and permissions
const userRoles = {
  Admin: {
    Purchase: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Issue'],
    // ... all permissions
  },
  PurchaseManager: {
    Purchase: ['Create', 'Read', 'Update', 'Approve'],
  },
  PurchaseOfficer: {
    Purchase: ['Create', 'Read', 'Update'],
  },
  ProjectManager: {
    Purchase: ['Create', 'Read'], // Can only create MRs
  },
  Viewer: {
    Purchase: ['Read'],
  }
};
```

### Data Validation

```javascript
// validation/supplier.js
const Joi = require('joi');

const supplierSchema = Joi.object({
  name: Joi.string().required().trim().min(3).max(100),
  contact: Joi.string().required().trim().min(3).max(100),
  phone: Joi.string().required().pattern(/^[0-9]{10}$/),
  email: Joi.string().required().email(),
  gst: Joi.string().optional().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
  pan: Joi.string().optional().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  address: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  pincode: Joi.string().optional().pattern(/^[0-9]{6}$/),
  bankName: Joi.string().optional(),
  accountNo: Joi.string().optional(),
  ifsc: Joi.string().optional().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  rating: Joi.number().optional().min(1).max(5),
  paymentTerms: Joi.string().optional(),
  active: Joi.boolean().optional()
});

function validateSupplier(data) {
  return supplierSchema.validate(data, { abortEarly: false });
}

module.exports = { validateSupplier };
```

---

## File Structure

```
backend/
├── config/
│   ├── database.js
│   └── constants.js
├── middleware/
│   ├── auth.js
│   ├── permissions.js
│   ├── validation.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Supplier.js
│   ├── MaterialRequisition.js
│   ├── Quotation.js
│   ├── ComparativeStatement.js
│   ├── PurchaseOrder.js
│   ├── PurchaseBill.js
│   └── MaterialRate.js
├── routes/
│   ├── auth.js
│   ├── suppliers.js
│   ├── material-requisitions.js
│   ├── quotations.js
│   ├── comparative-statements.js
│   ├── purchase-orders.js
│   ├── purchase-bills.js
│   ├── material-rates.js
│   └── purchase-dashboard.js
├── controllers/
│   ├── supplierController.js
│   ├── mrController.js
│   ├── poController.js
│   └── billController.js
├── services/
│   ├── supplierService.js
│   ├── purchaseService.js
│   └── accountsService.js
├── utils/
│   ├── codeGenerator.js
│   ├── pdfGenerator.js
│   ├── emailService.js
│   ├── workflow.js
│   ├── accountsIntegration.js
│   ├── notifications.js
│   └── validation.js
├── validation/
│   ├── supplier.js
│   ├── mr.js
│   ├── po.js
│   └── bill.js
├── tests/
│   ├── suppliers.test.js
│   ├── mrs.test.js
│   ├── pos.test.js
│   └── integration/
│       └── purchase-workflow.test.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

## Initial Setup - Creating First Admin User

Since the registration endpoint requires admin authentication, you need to create the first admin user directly in the database. Here's how:

### Method 1: Using MongoDB Shell

```javascript
// Connect to MongoDB
mongosh "mongodb://localhost:27017/construction-erp"

// Hash the password using Node.js bcrypt
// First, run this in a Node.js script or terminal:
const bcrypt = require('bcryptjs');
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash('Admin@123', salt);
console.log(hashedPassword);

// Then insert admin user with hashed password
db.users.insertOne({
  name: "System Administrator",
  email: "admin@company.com",
  password: "<PASTE_HASHED_PASSWORD_HERE>",
  phone: "9999999999",
  department: "Admin",
  designation: "Administrator",
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Get the user ID
const adminUser = db.users.findOne({ email: "admin@company.com" });

// Assign Admin role with full permissions
db.userroles.insertOne({
  userId: adminUser._id,
  role: "Admin",
  permissions: [
    {
      module: "Purchase",
      actions: ["Create", "Read", "Update", "Delete", "Approve", "Issue"]
    },
    {
      module: "Engineering",
      actions: ["Create", "Read", "Update", "Delete", "Approve"]
    },
    {
      module: "Site",
      actions: ["Create", "Read", "Update", "Delete"]
    },
    {
      module: "Accounts",
      actions: ["Create", "Read", "Update", "Delete"]
    },
    {
      module: "Contracts",
      actions: ["Create", "Read", "Update", "Delete", "Approve"]
    },
    {
      module: "Workflow",
      actions: ["Create", "Read", "Update", "Delete"]
    },
    {
      module: "Admin",
      actions: ["Create", "Read", "Update", "Delete"]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Method 2: Using Node.js Script

```javascript
// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const UserRole = require('./models/UserRole');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    
    // Create admin user
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@company.com',
      password: 'Admin@123', // Will be hashed by pre-save middleware
      phone: '9999999999',
      department: 'Admin',
      designation: 'Administrator',
      active: true,
    });
    
    await admin.save();
    console.log('Admin user created:', admin.email);
    
    // Assign Admin role with full permissions
    const adminRole = new UserRole({
      userId: admin._id,
      role: 'Admin',
      permissions: [
        { module: 'Purchase', actions: ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Issue'] },
        { module: 'Engineering', actions: ['Create', 'Read', 'Update', 'Delete', 'Approve'] },
        { module: 'Site', actions: ['Create', 'Read', 'Update', 'Delete'] },
        { module: 'Accounts', actions: ['Create', 'Read', 'Update', 'Delete'] },
        { module: 'Contracts', actions: ['Create', 'Read', 'Update', 'Delete', 'Approve'] },
        { module: 'Workflow', actions: ['Create', 'Read', 'Update', 'Delete'] },
        { module: 'Admin', actions: ['Create', 'Read', 'Update', 'Delete'] },
      ],
    });
    
    await adminRole.save();
    console.log('Admin role assigned');
    
    console.log('\n=== Admin User Created Successfully ===');
    console.log('Email:', admin.email);
    console.log('Password: Admin@123');
    console.log('Please change the password after first login!');
    console.log('======================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
```

**Run the script:**
```bash
node scripts/createAdmin.js
```

### After Admin Creation

1. **Login with admin credentials:**
   - Email: `admin@company.com`
   - Password: `Admin@123`

2. **Change the default password immediately** using the `/api/auth/change-password` endpoint

3. **Create other users** through the admin panel using `/api/auth/register` endpoint

4. **Assign appropriate roles** (PurchaseManager, PurchaseOfficer, ProjectManager, etc.) to each user based on their department and responsibilities

---

## Testing Strategy

### Unit Tests Example

```javascript
// tests/suppliers.test.js
const request = require('supertest');
const app = require('../server');
const Supplier = require('../models/Supplier');
const { generateToken } = require('../utils/auth');

describe('Supplier API', () => {
  let authToken;
  
  beforeAll(async () => {
    authToken = generateToken({ userId: 'testuser', role: 'Admin' });
  });
  
  afterEach(async () => {
    await Supplier.deleteMany({ name: /Test Supplier/ });
  });
  
  describe('POST /api/suppliers', () => {
    it('should create a new supplier', async () => {
      const supplierData = {
        name: 'Test Supplier Ltd',
        contact: 'John Doe',
        phone: '9876543210',
        email: 'test@supplier.com',
        gst: '29ABCDE1234F1Z5',
        city: 'Mumbai',
        state: 'Maharashtra'
      };
      
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(supplierData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(supplierData.name);
      expect(response.body.data.code).toMatch(/^SUPP/);
    });
    
    it('should validate GST format', async () => {
      const supplierData = {
        name: 'Test Supplier',
        contact: 'John Doe',
        phone: '9876543210',
        email: 'test@supplier.com',
        gst: 'INVALID_GST',
      };
      
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(supplierData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
  
  describe('GET /api/suppliers', () => {
    it('should return paginated suppliers list', async () => {
      const response = await request(app)
        .get('/api/suppliers?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.total).toBeDefined();
      expect(response.body.page).toBe(1);
    });
  });
});
```

---

## Environment Variables

```bash
# .env.example
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/construction_erp
MONGODB_TEST_URI=mongodb://localhost:27017/construction_erp_test

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760 # 10MB

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@constructionerp.com

# AWS S3 (if using)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=construction-erp-files

# API Rate Limiting
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
```

---

## Summary

This comprehensive backend documentation provides:

1. **Complete User Authentication System** with JWT tokens, password hashing, and role-based access control
2. **Admin Setup Guide** for creating the first admin user directly in the database
3. **Complete MongoDB schemas** for Users, Roles, and Purchase entities with proper indexes and validation
4. **RESTful API endpoints** with authentication and authorization middleware
5. **Business logic** for code generation, workflows, and integrations
6. **Integration points** with Engineering, Site, Accounts, and Workflow modules
7. **Security measures** including RBAC, JWT authentication, password hashing (bcrypt), and input validation
8. **File structure** following industry best practices
9. **Testing strategy** with example unit tests

### Authentication Flow

1. **Initial Setup**: Create first admin user directly in MongoDB using the provided script
2. **Admin Login**: Admin logs in with email/password, receives JWT token
3. **User Management**: Admin creates additional users through `/api/auth/register` endpoint
4. **Role Assignment**: Each user is assigned roles (Admin, PurchaseManager, etc.) with specific permissions
5. **Access Control**: All API endpoints are protected with JWT authentication and role-based permissions

### Purchase Module Features

The Purchase Module is designed to be:
- **Scalable**: Proper indexing and pagination support
- **Secure**: JWT authentication, RBAC, bcrypt password hashing, input validation
- **Integrated**: Seamless connection with other ERP modules (Engineering, Site, Accounts, Workflow)
- **Maintainable**: Clean code structure and comprehensive documentation
- **Future-proof**: Modular design allows easy extension

### Quick Start

1. Install dependencies: `npm install`
2. Set up environment variables: Copy `.env.example` to `.env` and configure
3. Start MongoDB: `mongod`
4. Create first admin: `node scripts/createAdmin.js`
5. Start server: `npm start`
6. Login with admin credentials and start creating users, suppliers, and purchase orders

---

**Note**: Always keep your JWT_SECRET secure and change default admin password immediately after first login!
