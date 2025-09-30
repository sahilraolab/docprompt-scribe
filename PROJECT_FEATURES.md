# Construction ERP - Project Features

## Overview
A comprehensive Construction ERP system built with React, TypeScript, Tailwind CSS, and shadcn/ui. This application manages all aspects of construction project operations including procurement, contracts, site management, accounting, and workflows.

## Technology Stack
- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **API Mocking**: MSW (Mock Service Worker)
- **Build Tool**: Vite

## Module Overview

### 1. Dashboard Module
**Features:**
- KPI cards with trends (Active Projects, Budget, Approvals, Contractors)
- Project Status Distribution (Pie Chart)
- Monthly Expenses breakdown (Bar Chart)
- Project Progress visualization
- Pending Approvals summary
- Recent Activity feed with status indicators
- Real-time notifications

**Key Metrics:**
- Total active projects count
- Budget utilization
- Pending approval items
- Active contractor count

---

### 2. Engineering Module
**Sub-Modules:**
- Projects Management
- Project Estimates (with versioning)
- Document Management

**Features:**
- Project listing with search and filters
- Project details with timelines and budgets
- Versioned estimates with BOQ (Bill of Quantities)
- Estimate form with dynamic item addition
- Document upload and categorization
- Drawing/Report version control
- Project progress tracking

**Forms:**
- Estimate creation with line items
- Project document upload

---

### 3. Purchase Module
**Sub-Modules:**
- Material Requisitions (MR)
- Quotations
- Comparative Statements
- Purchase Orders (PO)
- Purchase Bills
- Suppliers Management

**Features:**
- MR creation and approval workflow
- Multi-supplier quotation management
- Comparative analysis of quotes
- PO generation from approved quotes
- Purchase bill matching with POs
- Supplier master with ratings
- Payment terms tracking
- GST and tax management

**Forms:**
- Material Requisition Form
- Purchase Order Form
- Purchase Bill Form
- Supplier Master Form

---

### 4. Contracts Module
**Sub-Modules:**
- Contractors Management
- Work Orders (WO)
- RA Bills (Running Account)
- Labour Rates

**Features:**
- Contractor database with ratings
- Work order creation and tracking
- WO progress monitoring (%)
- RA bill generation with deductions
- Payment milestone tracking
- Labour category rate master
- Contractor performance evaluation
- Work order details with item breakdown

**Forms:**
- Contractor Master Form
- Work Order Form (with scope of work)
- RA Bill Form

**Detail Views:**
- Work Order Details (with milestones, progress, payments)

---

### 5. Site & Store Module
**Sub-Modules:**
- Items Master
- Stock Management
- GRN (Goods Receipt Note)
- Material Issues
- Stock Transfers
- Quality Control (QC)

**Features:**
- Item master with categories
- Real-time stock tracking
- GRN against POs
- Material issue to projects/sites
- Inter-project stock transfers
- QC inspection records
- Min/Max stock alerts
- Reorder level management
- HSN code and tax rate setup

**Forms:**
- Item Master Form
- GRN Form
- Issue Note Form
- Transfer Note Form
- QC Inspection Form

---

### 6. Accounts & Finance Module
**Sub-Modules:**
- Journal Entries
- Chart of Accounts (Ledgers)
- Financial Reports
- Cost Centers

**Features:**
- Double-entry accounting
- Journal voucher creation
- Ledger management (Assets, Liabilities, Income, Expenses)
- Trial Balance
- Profit & Loss Statement
- Balance Sheet
- Cash Flow Statement
- Project-wise cost tracking
- Debit/Credit note support

**Forms:**
- Journal Entry Form
- Ledger Account Form

**Reports:**
- Trial Balance
- P&L Statement
- Balance Sheet
- Cash Flow

---

### 7. Workflow & Approvals Module
**Sub-Modules:**
- Approval Queue
- Workflow Configuration
- SLA Management

**Features:**
- Multi-level approval workflows
- Configurable approval rules per module
- SLA tracking and breach alerts
- Approval history and audit trail
- Auto-escalation on SLA breach
- Role-based approval routing
- Workflow analytics

**Capabilities:**
- Define approval levels (L1, L2, L3...)
- Set approval rules by amount/project
- Track SLA compliance rates
- Configure notification triggers

---

### 8. Admin Module
**Sub-Modules:**
- User Management
- Audit Trail

**Features:**
- User CRUD operations
- Role-based access control (RBAC)
- User activation/deactivation
- Audit log of all actions
- Activity tracking (Create, Update, Delete, Approve)
- IP address logging
- User session management

**Security:**
- Action-level auditing
- User permission management
- Session timeout controls

---

### 9. Notifications Module
**Features:**
- Real-time notification center
- Categorized notifications (Approvals, Updates, Alerts)
- Mark as read/unread
- Notification preferences
- Email notification toggle
- Push notification support

**Types:**
- Approval requests
- SLA breach alerts
- Project updates
- System announcements

---

### 10. Settings Module
**Features:**
- Company profile
- System preferences
- Module configuration
- Theme settings
- Notification settings
- Integration settings

---

### 11. User Profile
**Features:**
- Personal information management
- Password change
- Email/Phone update
- Notification preferences
- Session management
- Permission view
- Avatar upload
- Activity history

---

## Common Features Across Modules

### Search & Filters
- Global search functionality
- Module-specific filters
- Advanced search options
- Date range filters
- Status-based filters

### Data Tables
- Sortable columns
- Pagination
- Row selection
- Bulk actions
- Export to CSV/Excel
- Print views
- Responsive design

### Forms
- Comprehensive validation (Zod)
- Dynamic field addition
- Auto-calculations
- File uploads
- Rich text editors
- Date pickers
- Dropdown selects

### Status Management
- Color-coded status badges
- Workflow state tracking
- Status change history
- Approval status indicators

### Reporting
- Module-wise reports
- Custom date ranges
- Export functionality
- Print-friendly layouts
- Charts and graphs

---

## Design System

### UI Components (shadcn/ui)
- Buttons, Cards, Badges
- Forms (Input, Select, Textarea, Checkbox, Switch)
- Data Display (Tables, Lists)
- Navigation (Sidebar, Tabs, Breadcrumbs)
- Overlays (Dialog, Sheet, Popover, Dropdown)
- Feedback (Toast, Alert, Progress)
- Charts (Recharts integration)

### Color Scheme
- Semantic tokens for theming
- HSL color system
- Light/Dark mode support
- Consistent color usage

### Typography
- Hierarchical headings
- Responsive font sizes
- Consistent spacing

---

## Workflow Examples

### Purchase Order Flow
1. Engineer creates Material Requisition
2. MR routed for Project Manager approval
3. Procurement sends RFQ to suppliers
4. Suppliers submit quotations
5. Comparative statement generated
6. Best supplier selected
7. Purchase Order created
8. PO sent for approval (if above threshold)
9. Approved PO sent to supplier
10. GRN created upon material receipt
11. QC inspection performed
12. Stock updated
13. Purchase Bill matched with PO
14. Payment processed

### Work Order Flow
1. Contractor registered in system
2. Work Order created with scope
3. WO sent for approval
4. Approved WO issued to contractor
5. Work progress tracked (%)
6. RA Bills submitted periodically
7. Bills verified against work done
8. Deductions applied (if any)
9. Payment released
10. Work completion certified

---

## Role-Based Access Control (RBAC)

### Roles
- **Admin**: Full system access
- **Project Manager**: Project-level access
- **Site Engineer**: Site operations
- **Procurement Manager**: Purchase module
- **Accountant**: Finance module
- **Store Manager**: Store operations
- **Contractor**: Limited view access

### Permissions
- Module-level access
- Action-based permissions (View, Create, Edit, Delete, Approve)
- Data-level security
- Project-wise access control

---

## Data Format & Standards

### Currency
- Indian Rupee (INR) format
- Lakhs/Crores notation
- Decimal precision: 2 places

### Date/Time
- Format: DD/MM/YYYY
- Timezone: Asia/Kolkata (IST)
- Relative time display (e.g., "2 hours ago")

### Phone Numbers
- Indian format: +91 XXXXX XXXXX
- 10-digit validation

### Measurements
- Units: SQM, CUM, RMT, NOS, KG, TON, BAG, LTR
- Quantity precision: 2 decimals

---

## Technical Implementation

### State Management
- React Query for server state
- Local state with useState/useReducer
- Form state with React Hook Form
- URL state with React Router

### API Layer
- MSW for API mocking
- RESTful endpoints
- Consistent response format
- Error handling

### Form Validation
- Zod schema validation
- Real-time field validation
- Custom validation rules
- Error message display

### Code Organization
```
src/
├── components/        # Reusable UI components
├── pages/            # Page components by module
├── contexts/         # React contexts (Auth, etc.)
├── hooks/            # Custom hooks
├── lib/              # Utilities and helpers
│   ├── api/         # API client
│   ├── hooks/       # Data fetching hooks
│   ├── msw/         # Mock Service Worker setup
│   └── utils/       # Helper functions
├── types/            # TypeScript type definitions
└── main.tsx         # App entry point
```

---

## Mock Data Coverage

### Users
- 10+ user accounts with different roles
- Admin, Managers, Engineers, Accountants

### Projects
- 5 active construction projects
- Various statuses (Planning, Active, Completed)

### Suppliers
- 40+ suppliers with ratings
- Multiple categories

### Contractors
- 15+ contractors
- Rating system

### Materials
- 50+ items across categories
- Stock levels and locations

---

## Error Handling

### Error Pages
- **404 Not Found**: For invalid routes
- **403 Forbidden**: For unauthorized access
- **500 Server Error**: For system errors

### Error Boundaries
- Component-level error catching
- Graceful degradation
- User-friendly error messages

---

## Future Enhancement Scope

### Potential Additions
- Real backend integration (Supabase)
- Real-time collaboration
- Mobile app (React Native)
- Advanced analytics
- AI-powered insights
- WhatsApp/Email integration
- Biometric attendance
- Equipment tracking
- Weather integration
- Drawing management system

---

## Performance Optimizations

### Implemented
- Code splitting
- Lazy loading of routes
- React Query caching
- Debounced search
- Virtualized lists (for large datasets)
- Image optimization

### Best Practices
- Memoization of expensive calculations
- Efficient re-render prevention
- Optimistic UI updates
- Progressive loading

---

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Consistent naming conventions

### Component Design
- Small, focused components
- Props interface definition
- Proper TypeScript typing
- Reusable logic in custom hooks

### Testing (Future)
- Unit tests with Vitest
- Integration tests
- E2E tests with Playwright

---

## License
This is a demo/prototype application for educational purposes.

---

**Last Updated**: January 2024
**Version**: 1.0.0 (Mock Data Phase 1)
