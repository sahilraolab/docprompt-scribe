# Purchase Module - Complete Backend Requirements

This document outlines all API controllers, database models, and seed data required to make the Purchase Module fully functional.

## Table of Contents
1. [Database Models](#database-models)
2. [API Controllers](#api-controllers)
3. [Seed Data Requirements](#seed-data-requirements)
4. [API Endpoint Summary](#api-endpoint-summary)

---

## Database Models

### 1. Suppliers Model ✅ (Already Implemented)
```typescript
interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone?: string;
  email?: string;
  gst?: string;
  city?: string;
  state?: string;
  rating?: number;
  active: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
  createdBy: string;
  updatedBy: string;
}
```

### 2. Material Requisitions (MRs) Model
```typescript
interface MR {
  id: string;
  projectId: string;
  code: string; // Auto-generated: MR-YYYY-0001
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string; // User ID
  items: MRItem[]; // JSON field or separate table
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: timestamp;
  rejectionReason?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
  createdBy: string;
  updatedBy: string;
}

interface MRItem {
  id: string;
  itemId: string; // Reference to Items/Materials master
  description: string;
  qty: number;
  uom: string;
  requiredBy?: string; // Date
}
```

**Database Table**: `material_requisitions`
**Relationships**:
- `projectId` → `projects.id`
- `requestedBy` → `users.id`
- `items.itemId` → `items.id`

### 3. Quotations Model
```typescript
interface Quotation {
  id: string;
  mrId: string; // Reference to Material Requisition
  supplierId: string;
  quotationNo: string; // Supplier's quotation number
  quotationDate: string;
  validUntil?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  remarks?: string;
  items: QuoteItem[]; // JSON field or separate table
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  createdAt: timestamp;
  updatedAt: timestamp;
  createdBy: string;
  updatedBy: string;
}

interface QuoteItem {
  id: string;
  mrItemId?: string; // Link to MR item
  description: string;
  qty: number;
  uom: string;
  rate: number;
  taxPct: number;
  amount: number; // qty * rate
}
```

**Database Table**: `quotations`
**Relationships**:
- `mrId` → `material_requisitions.id`
- `supplierId` → `suppliers.id`

### 4. Comparative Statements Model
```typescript
interface ComparativeStatement {
  id: string;
  mrId: string;
  code: string; // Auto-generated: CS-YYYY-0001
  quotationIds: string[]; // Array of quotation IDs being compared
  selectedSupplierId?: string; // Winner of comparison
  analysis: string; // Notes about comparison
  recommendations?: string;
  comparisonData: JSON; // Detailed comparison matrix
  status: 'Draft' | 'Under Review' | 'Approved' | 'Completed';
  createdAt: timestamp;
  updatedAt: timestamp;
  createdBy: string;
  updatedBy: string;
}
```

**Database Table**: `comparative_statements`
**Relationships**:
- `mrId` → `material_requisitions.id`
- `quotationIds` → `quotations.id[]`
- `selectedSupplierId` → `suppliers.id`

### 5. Purchase Orders (POs) Model
```typescript
interface PurchaseOrder {
  id: string;
  code: string; // Auto-generated: PO-YYYY-0001
  projectId: string;
  supplierId: string;
  mrId?: string; // Optional reference to source MR
  quotationId?: string; // Optional reference to accepted quotation
  poDate: string;
  deliveryDate?: string;
  deliveryAddress?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  remarks?: string;
  items: POItem[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Issued' | 'Partially Received' | 'Fully Received' | 'Cancelled';
  approvalStatus?: string;
  approvedBy?: string;
  approvedAt?: timestamp;
  createdAt: timestamp;
  updatedAt: timestamp;
  createdBy: string;
  updatedBy: string;
}

interface POItem {
  id: string;
  itemId?: string; // Reference to Items master
  description: string;
  qty: number;
  uom: string;
  rate: number;
  taxPct: number;
  amount: number;
  receivedQty?: number; // Track GRN quantity
}
```

**Database Table**: `purchase_orders`
**Relationships**:
- `projectId` → `projects.id`
- `supplierId` → `suppliers.id`
- `mrId` → `material_requisitions.id`
- `quotationId` → `quotations.id`

### 6. Purchase Bills Model
```typescript
interface PurchaseBill {
  id: string;
  poId: string;
  invoiceNo: string; // Supplier's invoice number
  invoiceDate: string;
  billDate: string;
  dueDate?: string;
  amount: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Verified' | 'Approved' | 'Paid' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Fully Paid';
  paidAmount?: number;
  remarks?: string;
  attachments?: string[]; // File URLs
  createdAt: timestamp;
  updatedAt: timestamp;
  createdBy: string;
  updatedBy: string;
}
```

**Database Table**: `purchase_bills`
**Relationships**:
- `poId` → `purchase_orders.id`

### 7. Material Rates Model
```typescript
interface MaterialRate {
  id: string;
  itemId: string;
  supplierId?: string; // If rate is supplier-specific
  rate: number;
  uom: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  source?: string; // 'quotation' | 'manual' | 'po'
  sourceId?: string; // Reference to source document
  createdAt: timestamp;
  updatedAt: timestamp;
  createdBy: string;
  updatedBy: string;
}
```

**Database Table**: `material_rates`
**Relationships**:
- `itemId` → `items.id`
- `supplierId` → `suppliers.id`

---

## API Controllers

### 1. Suppliers Controller ✅ (Already Implemented)
- `GET /api/purchase/suppliers` - List all suppliers
- `GET /api/purchase/suppliers/:id` - Get supplier details
- `POST /api/purchase/suppliers` - Create supplier
- `PUT /api/purchase/suppliers/:id` - Update supplier
- `DELETE /api/purchase/suppliers/:id` - Delete supplier

### 2. Material Requisitions Controller
**File**: `supabase/functions/purchase-mr/index.ts`

```typescript
// GET /api/purchase/mr - List all MRs with filters
// Query params: status, projectId, requestedBy, page, limit
router.get('/', async (req, res) => {
  // Fetch MRs with joins to projects and users
  // Apply filters
  // Paginate results
  // Return list with metadata
});

// GET /api/purchase/mr/:id - Get MR details
router.get('/:id', async (req, res) => {
  // Fetch MR with items
  // Join with project, user, items data
  // Return detailed MR
});

// POST /api/purchase/mr - Create new MR
router.post('/', async (req, res) => {
  // Validate input
  // Generate MR code (MR-YYYY-0001)
  // Create MR with items
  // Set status to 'Draft'
  // Return created MR
});

// PUT /api/purchase/mr/:id - Update MR
router.put('/:id', async (req, res) => {
  // Validate MR exists and is editable
  // Update MR and items
  // Return updated MR
});

// POST /api/purchase/mr/:id/submit - Submit MR for approval
router.post('/:id/submit', async (req, res) => {
  // Change status to 'Pending'
  // Trigger approval workflow
  // Send notifications
});

// POST /api/purchase/mr/:id/approve - Approve MR
router.post('/:id/approve', async (req, res) => {
  // Check user permissions
  // Update status to 'Approved'
  // Record approval details
  // Send notifications
});

// POST /api/purchase/mr/:id/reject - Reject MR
router.post('/:id/reject', async (req, res) => {
  // Check user permissions
  // Update status to 'Rejected'
  // Record rejection reason
  // Send notifications
});
```

### 3. Quotations Controller
**File**: `supabase/functions/purchase-quotations/index.ts`

```typescript
// GET /api/purchase/quotations - List all quotations
// Query params: mrId, supplierId, status, page, limit
router.get('/', async (req, res) => {
  // Fetch quotations with joins
  // Apply filters
  // Return list
});

// GET /api/purchase/quotations/:id - Get quotation details
router.get('/:id', async (req, res) => {
  // Fetch quotation with items
  // Join with MR, supplier data
  // Return detailed quotation
});

// GET /api/purchase/quotations/by-mr/:mrId - Get quotations for specific MR
router.get('/by-mr/:mrId', async (req, res) => {
  // Fetch all quotations for given MR
  // Used for comparative statement creation
  // Return quotations array
});

// POST /api/purchase/quotations - Create quotation
router.post('/', async (req, res) => {
  // Validate input
  // Create quotation with items
  // Calculate totals
  // Return created quotation
});

// PUT /api/purchase/quotations/:id - Update quotation
router.put('/:id', async (req, res) => {
  // Validate quotation exists
  // Update quotation and items
  // Recalculate totals
  // Return updated quotation
});

// DELETE /api/purchase/quotations/:id - Delete quotation
router.delete('/:id', async (req, res) => {
  // Soft delete or hard delete
  // Check if used in CS or PO
});
```

### 4. Comparative Statements Controller
**File**: `supabase/functions/purchase-comparative/index.ts`

```typescript
// GET /api/purchase/comparative - List comparative statements
// Query params: mrId, status, page, limit
router.get('/', async (req, res) => {
  // Fetch comparative statements
  // Join with MR data
  // Return list
});

// GET /api/purchase/comparative/:id - Get CS details
router.get('/:id', async (req, res) => {
  // Fetch CS with full comparison data
  // Include all quotations being compared
  // Return detailed CS with comparison matrix
});

// POST /api/purchase/comparative - Create comparative statement
router.post('/', async (req, res) => {
  // Validate MR exists
  // Validate quotations exist and belong to MR
  // Generate CS code (CS-YYYY-0001)
  // Create comparison matrix
  // Store CS
  // Return created CS
});

// PUT /api/purchase/comparative/:id - Update CS
router.put('/:id', async (req, res) => {
  // Update analysis, recommendations
  // Update selected supplier
  // Return updated CS
});

// POST /api/purchase/comparative/:id/select-supplier - Select winning supplier
router.post('/:id/select-supplier', async (req, res) => {
  // Update selectedSupplierId
  // Mark CS as completed
  // Can trigger PO creation
});
```

### 5. Purchase Orders Controller
**File**: `supabase/functions/purchase-po/index.ts`

```typescript
// GET /api/purchase/po - List purchase orders
// Query params: status, projectId, supplierId, page, limit
router.get('/', async (req, res) => {
  // Fetch POs with joins
  // Apply filters
  // Return list
});

// GET /api/purchase/po/:id - Get PO details
router.get('/:id', async (req, res) => {
  // Fetch PO with items
  // Join with project, supplier, MR data
  // Return detailed PO
});

// POST /api/purchase/po - Create PO
router.post('/', async (req, res) => {
  // Validate input
  // Generate PO code (PO-YYYY-0001)
  // Create PO with items
  // Calculate totals
  // Set status to 'Draft'
  // Return created PO
});

// PUT /api/purchase/po/:id - Update PO
router.put('/:id', async (req, res) => {
  // Validate PO is editable
  // Update PO and items
  // Recalculate totals
  // Return updated PO
});

// POST /api/purchase/po/:id/submit - Submit for approval
router.post('/:id/submit', async (req, res) => {
  // Change status to 'Pending Approval'
  // Trigger workflow
});

// POST /api/purchase/po/:id/approve - Approve PO
router.post('/:id/approve', async (req, res) => {
  // Update status to 'Approved'
  // Can auto-issue or wait for manual issue
});

// POST /api/purchase/po/:id/issue - Issue PO to supplier
router.post('/:id/issue', async (req, res) => {
  // Update status to 'Issued'
  // Send PO to supplier (email/notification)
  // Record issue date
});

// POST /api/purchase/po/:id/cancel - Cancel PO
router.post('/:id/cancel', async (req, res) => {
  // Update status to 'Cancelled'
  // Record reason
});
```

### 6. Purchase Bills Controller
**File**: `supabase/functions/purchase-bills/index.ts`

```typescript
// GET /api/purchase/bills - List bills
// Query params: poId, status, paymentStatus, page, limit
router.get('/', async (req, res) => {
  // Fetch bills with joins
  // Apply filters
  // Return list
});

// GET /api/purchase/bills/:id - Get bill details
router.get('/:id', async (req, res) => {
  // Fetch bill
  // Join with PO data
  // Return detailed bill
});

// POST /api/purchase/bills - Create bill
router.post('/', async (req, res) => {
  // Validate PO exists
  // Create bill
  // Set status to 'Pending'
  // Return created bill
});

// PUT /api/purchase/bills/:id - Update bill
router.put('/:id', async (req, res) => {
  // Update bill details
  // Return updated bill
});

// POST /api/purchase/bills/:id/verify - Verify bill
router.post('/:id/verify', async (req, res) => {
  // Update status to 'Verified'
});

// POST /api/purchase/bills/:id/approve - Approve bill
router.post('/:id/approve', async (req, res) => {
  // Update status to 'Approved'
  // Can trigger payment process
});

// POST /api/purchase/bills/:id/record-payment - Record payment
router.post('/:id/record-payment', async (req, res) => {
  // Update paidAmount
  // Update paymentStatus
  // If fully paid, update status
});
```

### 7. Material Rates Controller
**File**: `supabase/functions/purchase-rates/index.ts`

```typescript
// GET /api/purchase/rates - Get material rates
// Query params: itemId, supplierId, isActive
router.get('/', async (req, res) => {
  // Fetch rates with filters
  // Join with items and suppliers
  // Return rates
});

// GET /api/purchase/rates/item/:itemId - Get rates for specific item
router.get('/item/:itemId', async (req, res) => {
  // Fetch all rates for item
  // Group by supplier
  // Return rates with supplier info
});

// POST /api/purchase/rates - Create rate
router.post('/', async (req, res) => {
  // Validate input
  // Create rate entry
  // Return created rate
});

// PUT /api/purchase/rates/:id - Update rate
router.put('/:id', async (req, res) => {
  // Update rate
  // Can set isActive to false for old rates
});

// POST /api/purchase/rates/auto-update - Auto-update from quotations/POs
router.post('/auto-update', async (req, res) => {
  // Extract rates from recent quotations/POs
  // Create rate entries
  // Mark as auto-generated
});
```

---

## Seed Data Requirements

### 1. Projects Seed Data (Dependency)
```sql
INSERT INTO projects (id, name, code, status, location, startDate) VALUES
('proj-001', 'Metro Line Extension', 'PROJ-2024-001', 'Active', 'Mumbai', '2024-01-01'),
('proj-002', 'Highway Construction - Phase 2', 'PROJ-2024-002', 'Active', 'Delhi', '2024-02-01'),
('proj-003', 'Commercial Complex', 'PROJ-2024-003', 'Active', 'Bangalore', '2024-03-01'),
('proj-004', 'Residential Township', 'PROJ-2024-004', 'Planning', 'Pune', '2024-04-01'),
('proj-005', 'Bridge Repair Work', 'PROJ-2024-005', 'Active', 'Chennai', '2024-01-15');
```

### 2. Items/Materials Seed Data (Dependency)
```sql
INSERT INTO items (id, name, code, category, uom, minStock) VALUES
('item-001', 'Cement - OPC 43 Grade', 'MAT-CEM-001', 'Cement', 'Bag', 100),
('item-002', 'Steel TMT Bars 12mm', 'MAT-STL-012', 'Steel', 'Ton', 10),
('item-003', 'Steel TMT Bars 16mm', 'MAT-STL-016', 'Steel', 'Ton', 10),
('item-004', 'River Sand', 'MAT-SND-001', 'Sand', 'CFT', 500),
('item-005', 'Crushed Stone 20mm', 'MAT-AGG-020', 'Aggregate', 'CFT', 500),
('item-006', 'Bricks - Class A', 'MAT-BRK-001', 'Bricks', 'Nos', 5000),
('item-007', 'Paint - Asian Paints White', 'MAT-PNT-001', 'Paint', 'Ltr', 50),
('item-008', 'Electrical Wire 2.5mm', 'MAT-ELC-001', 'Electrical', 'Mtr', 200),
('item-009', 'PVC Pipe 110mm', 'MAT-PLB-001', 'Plumbing', 'Mtr', 100),
('item-010', 'Marble - Italian White', 'MAT-MAR-001', 'Marble', 'SqFt', 50);
```

### 3. Suppliers Seed Data ✅
```sql
INSERT INTO suppliers (id, name, code, contact, phone, email, gst, city, state, rating, active) VALUES
('sup-001', 'UltraTech Cement Ltd', 'SUP-001', 'Rajesh Kumar', '+91-9876543210', 'sales@ultratech.com', '27AAACU1234A1Z5', 'Mumbai', 'Maharashtra', 4.5, true),
('sup-002', 'Tata Steel Ltd', 'SUP-002', 'Priya Sharma', '+91-9876543211', 'contact@tatasteel.com', '33AAACT1234B1Z5', 'Jamshedpur', 'Jharkhand', 4.8, true),
('sup-003', 'JSW Steel', 'SUP-003', 'Amit Patel', '+91-9876543212', 'orders@jswsteel.com', '29AAACJ1234C1Z5', 'Bangalore', 'Karnataka', 4.6, true),
('sup-004', 'ACC Cement', 'SUP-004', 'Sunita Reddy', '+91-9876543213', 'enquiry@acc.com', '27AAACA1234D1Z5', 'Mumbai', 'Maharashtra', 4.3, true),
('sup-005', 'Birla Corporation', 'SUP-005', 'Rahul Jain', '+91-9876543214', 'sales@birlacorp.com', '19AAACB1234E1Z5', 'Kolkata', 'West Bengal', 4.4, true);
```

### 4. Material Requisitions Seed Data
```sql
INSERT INTO material_requisitions (id, projectId, code, status, requestedBy, items, createdAt) VALUES
('mr-001', 'proj-001', 'MR-2024-0001', 'Approved', 'user-001', 
'[
  {"id":"mri-001","itemId":"item-001","description":"Cement for foundation work","qty":500,"uom":"Bag","requiredBy":"2024-12-30"},
  {"id":"mri-002","itemId":"item-002","description":"Steel for reinforcement","qty":5,"uom":"Ton","requiredBy":"2024-12-30"}
]', '2024-10-01'),

('mr-002', 'proj-002', 'MR-2024-0002', 'Approved', 'user-002',
'[
  {"id":"mri-003","itemId":"item-003","description":"Steel TMT 16mm for pillars","qty":8,"uom":"Ton","requiredBy":"2024-12-25"},
  {"id":"mri-004","itemId":"item-005","description":"Aggregate for concrete","qty":1000,"uom":"CFT","requiredBy":"2024-12-25"}
]', '2024-10-05'),

('mr-003', 'proj-003', 'MR-2024-0003', 'Pending', 'user-003',
'[
  {"id":"mri-005","itemId":"item-006","description":"Bricks for wall construction","qty":10000,"uom":"Nos","requiredBy":"2024-12-20"}
]', '2024-10-10');
```

### 5. Quotations Seed Data
```sql
INSERT INTO quotations (id, mrId, supplierId, quotationNo, quotationDate, validUntil, items, status, subtotal, taxTotal, grandTotal) VALUES
('quot-001', 'mr-001', 'sup-001', 'QT-UC-2024-101', '2024-10-05', '2024-11-05',
'[
  {"id":"qi-001","description":"Cement OPC 43 Grade","qty":500,"uom":"Bag","rate":350,"taxPct":18,"amount":175000},
  {"id":"qi-002","description":"Steel TMT 12mm","qty":5,"uom":"Ton","rate":55000,"taxPct":18,"amount":275000}
]', 'Submitted', 450000, 81000, 531000, '2024-10-05'),

('quot-002', 'mr-001', 'sup-004', 'QT-ACC-2024-055', '2024-10-06', '2024-11-06',
'[
  {"id":"qi-003","description":"Cement OPC 43 Grade","qty":500,"uom":"Bag","rate":340,"taxPct":18,"amount":170000},
  {"id":"qi-004","description":"Steel TMT 12mm","qty":5,"uom":"Ton","rate":54000,"taxPct":18,"amount":270000}
]', 'Submitted', 440000, 79200, 519200, '2024-10-06'),

('quot-003', 'mr-002', 'sup-002', 'QT-TS-2024-220', '2024-10-08', '2024-11-08',
'[
  {"id":"qi-005","description":"Steel TMT 16mm","qty":8,"uom":"Ton","rate":56000,"taxPct":18,"amount":448000},
  {"id":"qi-006","description":"Aggregate 20mm","qty":1000,"uom":"CFT","rate":45,"taxPct":18,"amount":45000}
]', 'Submitted', 493000, 88740, 581740, '2024-10-08');
```

### 6. Comparative Statements Seed Data
```sql
INSERT INTO comparative_statements (id, mrId, code, quotationIds, selectedSupplierId, analysis, status, createdAt) VALUES
('cs-001', 'mr-001', 'CS-2024-0001', '["quot-001", "quot-002"]', 'sup-004', 
'After comparing 2 quotations, ACC Cement offers better pricing with ₹11,800 savings. Quality standards are equivalent for both suppliers. Delivery terms are acceptable. Recommendation: Award to ACC Cement (SUP-004).', 
'Approved', '2024-10-07');
```

### 7. Purchase Orders Seed Data
```sql
INSERT INTO purchase_orders (id, code, projectId, supplierId, mrId, quotationId, poDate, deliveryDate, items, status, subtotal, taxTotal, grandTotal) VALUES
('po-001', 'PO-2024-0001', 'proj-001', 'sup-004', 'mr-001', 'quot-002', '2024-10-10', '2024-10-25',
'[
  {"id":"poi-001","itemId":"item-001","description":"Cement OPC 43 Grade","qty":500,"uom":"Bag","rate":340,"taxPct":18,"amount":170000,"receivedQty":0},
  {"id":"poi-002","itemId":"item-002","description":"Steel TMT 12mm","qty":5,"uom":"Ton","rate":54000,"taxPct":18,"amount":270000,"receivedQty":0}
]', 'Issued', 440000, 79200, 519200, '2024-10-10');
```

### 8. Material Rates Seed Data
```sql
INSERT INTO material_rates (id, itemId, supplierId, rate, uom, effectiveFrom, isActive, source, sourceId) VALUES
('rate-001', 'item-001', 'sup-001', 350, 'Bag', '2024-10-01', true, 'quotation', 'quot-001'),
('rate-002', 'item-001', 'sup-004', 340, 'Bag', '2024-10-01', true, 'quotation', 'quot-002'),
('rate-003', 'item-002', 'sup-001', 55000, 'Ton', '2024-10-01', true, 'quotation', 'quot-001'),
('rate-004', 'item-002', 'sup-002', 54000, 'Ton', '2024-10-01', true, 'quotation', 'quot-002'),
('rate-005', 'item-003', 'sup-002', 56000, 'Ton', '2024-10-01', true, 'quotation', 'quot-003');
```

---

## API Endpoint Summary

### Material Requisitions
- ✅ `GET /api/purchase/mr` - List MRs
- ✅ `GET /api/purchase/mr/:id` - Get MR
- ✅ `POST /api/purchase/mr` - Create MR
- ✅ `PUT /api/purchase/mr/:id` - Update MR
- ⚠️ `POST /api/purchase/mr/:id/submit` - Submit for approval
- ⚠️ `POST /api/purchase/mr/:id/approve` - Approve MR
- ⚠️ `POST /api/purchase/mr/:id/reject` - Reject MR

### Quotations
- ✅ `GET /api/purchase/quotations` - List quotations
- ✅ `GET /api/purchase/quotations/:id` - Get quotation
- ⚠️ `GET /api/purchase/quotations/by-mr/:mrId` - Get by MR
- ✅ `POST /api/purchase/quotations` - Create quotation
- ✅ `PUT /api/purchase/quotations/:id` - Update quotation
- ⚠️ `DELETE /api/purchase/quotations/:id` - Delete quotation

### Comparative Statements
- ✅ `GET /api/purchase/comparative` - List CS
- ✅ `GET /api/purchase/comparative/:id` - Get CS
- ✅ `POST /api/purchase/comparative` - Create CS
- ⚠️ `PUT /api/purchase/comparative/:id` - Update CS
- ⚠️ `POST /api/purchase/comparative/:id/select-supplier` - Select supplier

### Purchase Orders
- ✅ `GET /api/purchase/po` - List POs
- ✅ `GET /api/purchase/po/:id` - Get PO
- ✅ `POST /api/purchase/po` - Create PO
- ✅ `PUT /api/purchase/po/:id` - Update PO
- ⚠️ `POST /api/purchase/po/:id/submit` - Submit for approval
- ⚠️ `POST /api/purchase/po/:id/approve` - Approve PO
- ⚠️ `POST /api/purchase/po/:id/issue` - Issue PO
- ⚠️ `POST /api/purchase/po/:id/cancel` - Cancel PO

### Purchase Bills
- ✅ `GET /api/purchase/bills` - List bills
- ✅ `GET /api/purchase/bills/:id` - Get bill
- ✅ `POST /api/purchase/bills` - Create bill
- ✅ `PUT /api/purchase/bills/:id` - Update bill
- ⚠️ `POST /api/purchase/bills/:id/verify` - Verify bill
- ⚠️ `POST /api/purchase/bills/:id/approve` - Approve bill
- ⚠️ `POST /api/purchase/bills/:id/record-payment` - Record payment

### Material Rates
- ✅ `GET /api/purchase/rates` - List rates
- ⚠️ `GET /api/purchase/rates/item/:itemId` - Get by item
- ✅ `POST /api/purchase/rates` - Create rate
- ✅ `PUT /api/purchase/rates/:id` - Update rate

**Legend:**
- ✅ Already implemented or documented
- ⚠️ Needs implementation

---

## Implementation Priority

### Phase 1 (Critical - Already in PURCHASE_MODULE_API_DOCUMENTATION.md)
1. ✅ Suppliers API
2. ✅ Material Requisitions API
3. ✅ Quotations API
4. ✅ Comparative Statements API
5. ✅ Purchase Orders API
6. ✅ Purchase Bills API

### Phase 2 (Enhancement)
1. Material Rates API with auto-update
2. Approval workflow endpoints
3. Status transition endpoints
4. Email notifications
5. File upload for bills

### Phase 3 (Advanced)
1. Analytics and reporting
2. Rate comparison engine
3. Supplier performance tracking
4. Integration with inventory (GRN)

---

## Next Steps

1. **Create database tables** for all models listed above
2. **Implement API controllers** in the order of priority
3. **Add seed data** to test the complete workflow
4. **Test API endpoints** using the frontend forms
5. **Add validation** and error handling
6. **Implement approval workflows**
7. **Add notifications** for status changes

Refer to `PURCHASE_MODULE_API_DOCUMENTATION.md` for detailed API specifications already documented.
