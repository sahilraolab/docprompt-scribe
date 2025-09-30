# Construction ERP System

A comprehensive Enterprise Resource Planning (ERP) solution designed specifically for construction companies to manage projects, procurement, contracts, site operations, and accounting.

## 🏗️ Features

### Engineering Module
- **Project Management**: Track multiple construction projects with budgets, timelines, and progress
- **Cost Estimation**: Create and manage detailed cost estimates with versioning
- **Document Management**: Store and organize drawings, reports, and project documents
- **Budget Tracking**: Monitor budget utilization and spending across projects

### Purchase Module
- **Material Requisitions (MR)**: Request materials needed for projects
- **Supplier Management**: Maintain supplier database with ratings and performance tracking
- **Quotation Management**: Collect and compare supplier quotations
- **Comparative Statements**: Analyze quotations and select best suppliers
- **Purchase Orders (PO)**: Generate and track purchase orders
- **Purchase Bills**: Record and manage supplier invoices

### Contracts Module
- **Contractor Management**: Maintain contractor database with ratings
- **Work Orders**: Create and track work orders for contractors
- **Running Account (RA) Bills**: Process progress billing with retention
- **Labour Rate Management**: Define and track labour rates by skill and category
- **Payment Tracking**: Monitor advance payments and recoveries

### Site Module
- **Item Master**: Maintain inventory of construction materials
- **Stock Management**: Track stock levels across multiple sites
- **Goods Receipt Notes (GRN)**: Record material receipts with quality checks
- **Material Issues**: Issue materials to projects and contractors
- **Inter-Project Transfers**: Transfer materials between project sites
- **Quality Control (QC)**: Document quality inspection reports

### Accounts Module
- **Chart of Accounts**: Hierarchical account structure
- **Journal Entries**: Record financial transactions with double-entry bookkeeping
- **Ledger Management**: View account-wise transaction history
- **Financial Reports**: Generate balance sheets, P&L statements, and custom reports

### Workflow & Approvals
- **Approval Workflows**: Configure multi-level approval processes
- **Role-Based Approvals**: Route approvals based on user roles and amounts
- **SLA Management**: Define and track service level agreements
- **Audit Trail**: Complete history of all approvals and actions

### Administration
- **User Management**: Create and manage user accounts
- **Role-Based Access Control (RBAC)**: Define permissions by role
- **Audit Logs**: Track all system activities
- **Settings**: Configure system preferences and defaults

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Mock API**: MSW (Mock Service Worker)

## 📋 Prerequisites

- Node.js 18+ or Bun
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
bun run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔐 Default Login Credentials

For development/demo purposes:
- **Email**: admin@example.com
- **Password**: password

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AppLayout.tsx   # Main layout wrapper
│   ├── AppSidebar.tsx  # Navigation sidebar
│   └── AppHeader.tsx   # Top header bar
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── hooks/              # Custom React hooks
├── lib/
│   ├── api/           # API integration
│   ├── constants/     # Application constants
│   ├── hooks/         # Data fetching hooks
│   ├── msw/           # Mock API handlers
│   └── utils/         # Utility functions
├── pages/             # Page components (one per route)
│   ├── engineering/   # Engineering module pages
│   ├── purchase/      # Purchase module pages
│   ├── contracts/     # Contracts module pages
│   ├── site/          # Site module pages
│   ├── accounts/      # Accounts module pages
│   ├── workflow/      # Workflow module pages
│   └── admin/         # Admin module pages
├── types/             # TypeScript type definitions
├── App.tsx            # Main app component with routing
├── main.tsx          # Application entry point
└── index.css         # Global styles and design tokens
```

## 🎨 Design System

The application uses a comprehensive design system with semantic tokens:

- **Colors**: Primary, secondary, accent, muted, destructive
- **Typography**: Consistent font scales and weights
- **Spacing**: 8px base grid system
- **Components**: Pre-built shadcn/ui components
- **Animations**: Smooth transitions and micro-interactions

## 🔒 Security Features

- Role-Based Access Control (RBAC)
- Secure authentication flow
- Input validation on all forms
- SQL injection prevention
- XSS protection
- CSRF token handling

## 📊 Key Workflows

### Purchase Workflow
1. Create Material Requisition (MR)
2. Request Quotations from Suppliers
3. Generate Comparative Statement
4. Create Purchase Order (PO)
5. Record Goods Receipt Note (GRN)
6. Process Purchase Bill

### Contract Workflow
1. Create Work Order
2. Track Progress
3. Generate RA Bill
4. Apply Retention
5. Process Payment

### Approval Workflow
1. Document Creation
2. Submit for Approval
3. Multi-level Review
4. Approval/Rejection
5. Notification to Creator

## 🧪 Testing

The application uses Mock Service Worker (MSW) for API mocking during development. All API calls are intercepted and return mock data.

## 📈 Performance

- Code splitting by route
- Lazy loading of components
- Optimized bundle size
- React Query for efficient data caching
- Debounced search and filtering

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 How to Edit This Project

**Use Lovable**: Simply visit [Lovable Project](https://lovable.dev/projects/5617d67b-7033-460b-a7e4-4b71cb378f80) and start prompting.

**Use your preferred IDE**: Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

**Edit directly in GitHub**: Navigate to files, click Edit button, make changes and commit.

**Use GitHub Codespaces**: Click Code -> Codespaces -> New codespace.

## 🚀 Deployment

Simply open [Lovable](https://lovable.dev/projects/5617d67b-7033-460b-a7e4-4b71cb378f80) and click on Share -> Publish.

For custom domains, navigate to Project > Settings > Domains. [Learn more](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🗺️ Roadmap

- [ ] Real backend API integration
- [ ] File upload and document storage
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced reporting and analytics
- [ ] Integration with accounting software
- [ ] Multi-language support
- [ ] PWA support

## 📞 Support

For support, visit the [Lovable Project](https://lovable.dev/projects/5617d67b-7033-460b-a7e4-4b71cb378f80) or contact the development team.
