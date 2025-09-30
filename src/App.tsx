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

// Engineering
import EngineeringIndex from "./pages/engineering/index";
import ProjectsList from "./pages/engineering/ProjectsList";
import ProjectDetails from "./pages/engineering/ProjectDetails";

// Purchase
import PurchaseIndex from "./pages/purchase/index";
import SuppliersList from "./pages/purchase/SuppliersList";
import PurchaseOrdersList from "./pages/purchase/PurchaseOrdersList";
import PODetails from "./pages/purchase/PODetails";

// Contracts
import ContractsIndex from "./pages/contracts/index";
import ContractorsList from "./pages/contracts/ContractorsList";
import WorkOrdersList from "./pages/contracts/WorkOrdersList";

// Site
import SiteIndex from "./pages/site/index";
import ItemsList from "./pages/site/ItemsList";
import StockList from "./pages/site/StockList";

// Other modules
import AccountsIndex from "./pages/accounts/index";
import WorkflowIndex from "./pages/workflow/index";
import NotificationsIndex from "./pages/notifications/index";
import AdminIndex from "./pages/admin/index";
import SettingsIndex from "./pages/settings/index";

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
            <Route path="/engineering/projects/:id" element={<ProtectedRoute><AppLayout><ProjectDetails /></AppLayout></ProtectedRoute>} />
            
            {/* Purchase */}
            <Route path="/purchase" element={<ProtectedRoute><AppLayout><PurchaseIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/suppliers" element={<ProtectedRoute><AppLayout><SuppliersList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/pos" element={<ProtectedRoute><AppLayout><PurchaseOrdersList /></AppLayout></ProtectedRoute>} />
            <Route path="/purchase/pos/:id" element={<ProtectedRoute><AppLayout><PODetails /></AppLayout></ProtectedRoute>} />
            
            {/* Contracts */}
            <Route path="/contracts" element={<ProtectedRoute><AppLayout><ContractsIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/contractors" element={<ProtectedRoute><AppLayout><ContractorsList /></AppLayout></ProtectedRoute>} />
            <Route path="/contracts/work-orders" element={<ProtectedRoute><AppLayout><WorkOrdersList /></AppLayout></ProtectedRoute>} />
            
            {/* Site */}
            <Route path="/site" element={<ProtectedRoute><AppLayout><SiteIndex /></AppLayout></ProtectedRoute>} />
            <Route path="/site/items" element={<ProtectedRoute><AppLayout><ItemsList /></AppLayout></ProtectedRoute>} />
            <Route path="/site/stock" element={<ProtectedRoute><AppLayout><StockList /></AppLayout></ProtectedRoute>} />
            
            {/* Accounts */}
            <Route path="/accounts" element={<ProtectedRoute><AppLayout><AccountsIndex /></AppLayout></ProtectedRoute>} />
            
            {/* Workflow */}
            <Route path="/workflow" element={<ProtectedRoute><AppLayout><WorkflowIndex /></AppLayout></ProtectedRoute>} />
            
            {/* Notifications */}
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><NotificationsIndex /></AppLayout></ProtectedRoute>} />
            
            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminIndex /></AppLayout></ProtectedRoute>} />
            
            {/* Settings */}
            <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsIndex /></AppLayout></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
