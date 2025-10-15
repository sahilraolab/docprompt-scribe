import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import UserProfile from "./pages/profile/UserProfile";

// Engineering
import EngineeringIndex from "./pages/engineering/index";
import ProjectsList from "./pages/engineering/ProjectsList";
import ProjectDetails from "./pages/engineering/ProjectDetails";
import ProjectForm from "./pages/engineering/ProjectForm";
import MaterialMasterList from "./pages/engineering/MaterialMasterList";
import MaterialMasterForm from "./pages/engineering/MaterialMasterForm";
import BOQList from "./pages/engineering/BOQList";
import BOQDetails from "./pages/engineering/BOQDetails";
import EstimatesList from "./pages/engineering/EstimatesList";
import EstimateForm from "./pages/engineering/EstimateForm";
import DocumentsList from "./pages/engineering/DocumentsList";
import DocumentUpload from "./pages/engineering/DocumentUpload";
import PlansList from "./pages/engineering/PlansList";
import PlanForm from "./pages/engineering/PlanForm";
import PlanDetails from "./pages/engineering/PlanDetails";

// Purchase
import PurchaseIndex from "./pages/purchase/index";
import SuppliersList from "./pages/purchase/SuppliersList";
import SupplierForm from "./pages/purchase/SupplierForm";
import PurchaseOrdersList from "./pages/purchase/PurchaseOrdersList";
import PODetails from "./pages/purchase/PODetails";
import POForm from "./pages/purchase/POForm";
import MRList from "./pages/purchase/MRList";
import MRForm from "./pages/purchase/MRForm";
import MRDetails from "./pages/purchase/MRDetails";
import QuotationsList from "./pages/purchase/QuotationsList";
import QuotationForm from "./pages/purchase/QuotationForm";
import QuotationDetails from "./pages/purchase/QuotationDetails";
import ComparativeStatementList from "./pages/purchase/ComparativeStatementList";
import ComparativeStatementForm from "./pages/purchase/ComparativeStatementForm";
import ComparativeStatementDetails from "./pages/purchase/ComparativeStatementDetails";
import PurchaseBillsList from "./pages/purchase/PurchaseBillsList";
import PurchaseBillForm from "./pages/purchase/PurchaseBillForm";
import PurchaseBillDetails from "./pages/purchase/PurchaseBillDetails";
import SupplierDetails from "./pages/purchase/SupplierDetails";
import RateManagement from "./pages/purchase/RateManagement";
import RateForm from "./pages/purchase/RateForm";

// Contracts
import ContractsIndex from "./pages/contracts/index";
import ContractorsList from "./pages/contracts/ContractorsList";
import ContractorForm from "./pages/contracts/ContractorForm";
import WorkOrdersList from "./pages/contracts/WorkOrdersList";
import WorkOrderDetails from "./pages/contracts/WorkOrderDetails";
import WorkOrderForm from "./pages/contracts/WorkOrderForm";
import RABillsList from "./pages/contracts/RABillsList";
import RABillForm from "./pages/contracts/RABillForm";
import LabourRatesList from "./pages/contracts/LabourRatesList";
import LabourRatesForm from "./pages/contracts/LabourRatesForm";
import ContractorDetails from "./pages/contracts/ContractorDetails";

// Site
import SiteIndex from "./pages/site/index";
import ItemsList from "./pages/site/ItemsList";
import ItemForm from "./pages/site/ItemForm";
import StockList from "./pages/site/StockList";
import GRNList from "./pages/site/GRNList";
import GRNForm from "./pages/site/GRNForm";
import IssuesList from "./pages/site/IssuesList";
import IssueForm from "./pages/site/IssueForm";
import TransfersList from "./pages/site/TransfersList";
import TransferForm from "./pages/site/TransferForm";
import QCList from "./pages/site/QCList";
import QCForm from "./pages/site/QCForm";
import ItemDetails from "./pages/site/ItemDetails";

// Other modules
import Notifications from "./pages/notifications/index";
import NotificationsList from "./pages/notifications/NotificationsList";
import Settings from "./pages/settings/index";
import SettingsPage from "./pages/settings/SettingsPage";
import Accounts from "./pages/accounts/index";
import AccountsList from "./pages/accounts/AccountsList";
import AccountForm from "./pages/accounts/AccountForm";
import JournalsList from "./pages/accounts/JournalsList";
import JournalForm from "./pages/accounts/JournalForm";
import LedgersList from "./pages/accounts/LedgersList";
import ReportsList from "./pages/accounts/ReportsList";
import Workflow from "./pages/workflow/index";
import ApprovalsList from "./pages/workflow/ApprovalsList";
import WorkflowConfigList from "./pages/workflow/WorkflowConfigList";
import WorkflowConfigForm from "./pages/workflow/WorkflowConfigForm";
import SLAList from "./pages/workflow/SLAList";
import SLAForm from "./pages/workflow/SLAForm";
import Admin from "./pages/admin/index";
import UsersList from "./pages/admin/UsersList";
import UserForm from "./pages/admin/UserForm";
import AuditTrailList from "./pages/admin/AuditTrailList";

// Partners
import PartnersIndex from "./pages/partners/index";
import PartnersList from "./pages/partners/PartnersList";
import PartnerForm from "./pages/partners/PartnerForm";
import ProjectInvestmentsList from "./pages/partners/ProjectInvestmentsList";
import ProjectInvestmentForm from "./pages/partners/ProjectInvestmentForm";
import ProfitEventsList from "./pages/partners/ProfitEventsList";
import ProfitEventForm from "./pages/partners/ProfitEventForm";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard */}
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            
            {/* Engineering */}
            <Route path="/engineering" element={<ProtectedRoute><AppLayout><EngineeringIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/projects" element={<ProtectedRoute><AppLayout><ProjectsList /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/projects/new" element={<ProtectedRoute><AppLayout><ProjectForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/projects/:id/edit" element={<ProtectedRoute><AppLayout><ProjectForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/projects/:id" element={<ProtectedRoute><AppLayout><ProjectDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/materials" element={<ProtectedRoute><AppLayout><MaterialMasterList /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/materials/new" element={<ProtectedRoute><AppLayout><MaterialMasterForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/materials/:id" element={<ProtectedRoute><AppLayout><MaterialMasterForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/boq" element={<ProtectedRoute><AppLayout><BOQList /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/boq/:id" element={<ProtectedRoute><AppLayout><BOQDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/estimates" element={<ProtectedRoute><AppLayout><EstimatesList /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/estimates/new" element={<ProtectedRoute><AppLayout><EstimateForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/estimates/:id" element={<ProtectedRoute><AppLayout><EstimateForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/documents" element={<ProtectedRoute><AppLayout><DocumentsList /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/documents/upload" element={<ProtectedRoute><AppLayout><DocumentUpload /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/plans" element={<ProtectedRoute><AppLayout><PlansList /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/plans/new" element={<ProtectedRoute><AppLayout><PlanForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/plans/:id/edit" element={<ProtectedRoute><AppLayout><PlanForm /></AppLayout></ProtectedRoute>} />
            <Route path="/engineering/plans/:id" element={<ProtectedRoute><AppLayout><PlanDetails /></AppLayout></ProtectedRoute>} />
            
            {/* Purchase */}
            <Route path="/purchase" element={<ProtectedRoute><AppLayout><PurchaseIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/suppliers" element={<ProtectedRoute><AppLayout><SuppliersList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/suppliers/new" element={<ProtectedRoute><AppLayout><SupplierForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/suppliers/:id/view" element={<ProtectedRoute><AppLayout><SupplierDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/suppliers/:id" element={<ProtectedRoute><AppLayout><SupplierForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/mrs" element={<ProtectedRoute><AppLayout><MRList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/mrs/new" element={<ProtectedRoute><AppLayout><MRForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/mrs/:id/view" element={<ProtectedRoute><AppLayout><MRDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/mrs/:id" element={<ProtectedRoute><AppLayout><MRForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/quotations" element={<ProtectedRoute><AppLayout><QuotationsList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/quotations/new" element={<ProtectedRoute><AppLayout><QuotationForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/quotations/:id/view" element={<ProtectedRoute><AppLayout><QuotationDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/quotations/:id" element={<ProtectedRoute><AppLayout><QuotationForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/comparative" element={<ProtectedRoute><AppLayout><ComparativeStatementList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/comparative/new" element={<ProtectedRoute><AppLayout><ComparativeStatementForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/comparative/:id/view" element={<ProtectedRoute><AppLayout><ComparativeStatementDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/comparative/:id" element={<ProtectedRoute><AppLayout><ComparativeStatementForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/pos" element={<ProtectedRoute><AppLayout><PurchaseOrdersList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/pos/new" element={<ProtectedRoute><AppLayout><POForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/pos/:id/edit" element={<ProtectedRoute><AppLayout><POForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/pos/:id" element={<ProtectedRoute><AppLayout><PODetails /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/bills" element={<ProtectedRoute><AppLayout><PurchaseBillsList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/bills/new" element={<ProtectedRoute><AppLayout><PurchaseBillForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/bills/:id/view" element={<ProtectedRoute><AppLayout><PurchaseBillDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/bills/:id" element={<ProtectedRoute><AppLayout><PurchaseBillForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/rates" element={<ProtectedRoute><AppLayout><RateManagement /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/rates/new" element={<ProtectedRoute><AppLayout><RateForm /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/rates/:id" element={<ProtectedRoute><AppLayout><RateForm /></AppLayout></ProtectedRoute>} />
            
            {/* Contracts */}
            <Route path="/contracts" element={<ProtectedRoute><AppLayout><ContractsIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/contractors" element={<ProtectedRoute><AppLayout><ContractorsList /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/contractors/new" element={<ProtectedRoute><AppLayout><ContractorForm /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/contractors/:id/view" element={<ProtectedRoute><AppLayout><ContractorDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/contractors/:id" element={<ProtectedRoute><AppLayout><ContractorForm /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/work-orders" element={<ProtectedRoute><AppLayout><WorkOrdersList /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/work-orders/new" element={<ProtectedRoute><AppLayout><WorkOrderForm /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/work-orders/:id/edit" element={<ProtectedRoute><AppLayout><WorkOrderForm /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/work-orders/:id" element={<ProtectedRoute><AppLayout><WorkOrderDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/ra-bills" element={<ProtectedRoute><AppLayout><RABillsList /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/ra-bills/new" element={<ProtectedRoute><AppLayout><RABillForm /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/ra-bills/:id" element={<ProtectedRoute><AppLayout><RABillForm /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/labour-rates" element={<ProtectedRoute><AppLayout><LabourRatesList /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/labour-rates/new" element={<ProtectedRoute><AppLayout><LabourRatesForm /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/labour-rates/:id" element={<ProtectedRoute><AppLayout><LabourRatesForm /></AppLayout></ProtectedRoute>} />
            
            {/* Site */}
            <Route path="/site" element={<ProtectedRoute><AppLayout><SiteIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/site/items" element={<ProtectedRoute><AppLayout><ItemsList /></AppLayout></ProtectedRoute>} />
            <Route path="/site/items/new" element={<ProtectedRoute><AppLayout><ItemForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/items/:id/view" element={<ProtectedRoute><AppLayout><ItemDetails /></AppLayout></ProtectedRoute>} />
            <Route path="/site/items/:id" element={<ProtectedRoute><AppLayout><ItemForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/stock" element={<ProtectedRoute><AppLayout><StockList /></AppLayout></ProtectedRoute>} />
            <Route path="/site/grn" element={<ProtectedRoute><AppLayout><GRNList /></AppLayout></ProtectedRoute>} />
            <Route path="/site/grn/new" element={<ProtectedRoute><AppLayout><GRNForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/grn/:id" element={<ProtectedRoute><AppLayout><GRNForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/issues" element={<ProtectedRoute><AppLayout><IssuesList /></AppLayout></ProtectedRoute>} />
            <Route path="/site/issues/new" element={<ProtectedRoute><AppLayout><IssueForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/issues/:id" element={<ProtectedRoute><AppLayout><IssueForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/transfers" element={<ProtectedRoute><AppLayout><TransfersList /></AppLayout></ProtectedRoute>} />
            <Route path="/site/transfers/new" element={<ProtectedRoute><AppLayout><TransferForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/transfers/:id" element={<ProtectedRoute><AppLayout><TransferForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/qc" element={<ProtectedRoute><AppLayout><QCList /></AppLayout></ProtectedRoute>} />
            <Route path="/site/qc/new" element={<ProtectedRoute><AppLayout><QCForm /></AppLayout></ProtectedRoute>} />
            <Route path="/site/qc/:id" element={<ProtectedRoute><AppLayout><QCForm /></AppLayout></ProtectedRoute>} />
            
            {/* Accounts */}
            <Route path="/accounts" element={<ProtectedRoute><AppLayout><Accounts /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/list" element={<ProtectedRoute><AppLayout><AccountsList /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/list/new" element={<ProtectedRoute><AppLayout><AccountForm /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/list/:id" element={<ProtectedRoute><AppLayout><AccountForm /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/journals" element={<ProtectedRoute><AppLayout><JournalsList /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/journals/new" element={<ProtectedRoute><AppLayout><JournalForm /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/journals/:id" element={<ProtectedRoute><AppLayout><JournalForm /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/ledgers" element={<ProtectedRoute><AppLayout><LedgersList /></AppLayout></ProtectedRoute>} />
            <Route path="/accounts/reports" element={<ProtectedRoute><AppLayout><ReportsList /></AppLayout></ProtectedRoute>} />
            
            {/* Workflow */}
            <Route path="/workflow" element={<ProtectedRoute><AppLayout><Workflow /></AppLayout></ProtectedRoute>} />
            <Route path="/workflow/approvals" element={<ProtectedRoute><AppLayout><ApprovalsList /></AppLayout></ProtectedRoute>} />
            <Route path="/workflow/config" element={<ProtectedRoute><AppLayout><WorkflowConfigList /></AppLayout></ProtectedRoute>} />
            <Route path="/workflow/config/new" element={<ProtectedRoute><AppLayout><WorkflowConfigForm /></AppLayout></ProtectedRoute>} />
            <Route path="/workflow/config/:id" element={<ProtectedRoute><AppLayout><WorkflowConfigForm /></AppLayout></ProtectedRoute>} />
            <Route path="/workflow/sla" element={<ProtectedRoute><AppLayout><SLAList /></AppLayout></ProtectedRoute>} />
            <Route path="/workflow/sla/new" element={<ProtectedRoute><AppLayout><SLAForm /></AppLayout></ProtectedRoute>} />
            <Route path="/workflow/sla/:id" element={<ProtectedRoute><AppLayout><SLAForm /></AppLayout></ProtectedRoute>} />
            
            {/* Notifications */}
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications/list" element={<ProtectedRoute><AppLayout><NotificationsList /></AppLayout></ProtectedRoute>} />
            
            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute><AppLayout><Admin /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AppLayout><UsersList /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users/new" element={<ProtectedRoute><AppLayout><UserForm /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute><AppLayout><UserForm /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users/new" element={<ProtectedRoute><AppLayout><UserForm /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users/:id" element={<ProtectedRoute><AppLayout><UserForm /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute><AppLayout><AuditTrailList /></AppLayout></ProtectedRoute>} />
            
            {/* Settings */}
            <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/settings/general" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
            
            {/* Partners */}
            <Route path="/partners" element={<ProtectedRoute><AppLayout><PartnersIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/list" element={<ProtectedRoute><AppLayout><PartnersList /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/list/new" element={<ProtectedRoute><AppLayout><PartnerForm /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/list/:id" element={<ProtectedRoute><AppLayout><PartnerForm /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/investments" element={<ProtectedRoute><AppLayout><ProjectInvestmentsList /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/investments/new" element={<ProtectedRoute><AppLayout><ProjectInvestmentForm /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/investments/:id" element={<ProtectedRoute><AppLayout><ProjectInvestmentForm /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/profit-events" element={<ProtectedRoute><AppLayout><ProfitEventsList /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/profit-events/new" element={<ProtectedRoute><AppLayout><ProfitEventForm /></AppLayout></ProtectedRoute>} />
            <Route path="/partners/profit-events/:id" element={<ProtectedRoute><AppLayout><ProfitEventForm /></AppLayout></ProtectedRoute>} />
            
            {/* Profile */}
            <Route path="/profile" element={<ProtectedRoute><AppLayout><UserProfile /></AppLayout></ProtectedRoute>} />
            
            {/* Error Pages */}
            <Route path="/403" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
