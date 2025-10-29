import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Package, 
  Users, 
  FileText, 
  AlertCircle,
  Building2,
  ShoppingCart,
  Briefcase,
  DollarSign,
  TrendingDown,
  Hammer,
  Warehouse,
  ArrowRight,
  Download,
  Eye,
  Calculator,
  GitBranch,
  BarChart3,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useProjects } from '@/lib/hooks/useProjects';
import { usePOs, useMRs, useSuppliers } from '@/lib/hooks/usePurchase';
import { useContractors, useWorkOrders, useRABills } from '@/lib/hooks/useContractors';
import { useItems, useStock } from '@/lib/hooks/useSite';
import { useJournals } from '@/lib/hooks/useAccounts';
import { usePartners, useInvestments, useProfitEvents } from '@/lib/hooks/usePartners';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch data from modules
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: pos = [] } = usePOs();
  const { data: mrs = [] } = useMRs();
  const { data: suppliers = [] } = useSuppliers();
  const { data: contractors = [] } = useContractors();
  const { data: workOrders = [] } = useWorkOrders();
  const { data: raBills = [] } = useRABills();
  const { data: items = [] } = useItems();
  const { data: stock = [] } = useStock();
  const { data: journals = [] } = useJournals();
  const { data: partners = [] } = usePartners();
  const { data: investments = [] } = useInvestments();
  const { data: profitEvents = [] } = useProfitEvents();

  // Safe array conversions
  const projectList = Array.isArray(projects) ? projects : [];
  const poList = Array.isArray(pos) ? pos : [];
  const mrList = Array.isArray(mrs) ? mrs : [];
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const contractorList = Array.isArray(contractors) ? contractors : [];
  const woList = Array.isArray(workOrders) ? workOrders : [];
  const raBillList = Array.isArray(raBills) ? raBills : [];
  const itemList = Array.isArray(items) ? items : [];
  const stockList = Array.isArray(stock) ? stock : [];
  const journalList = Array.isArray(journals) ? journals : [];
  const partnerList = Array.isArray(partners) ? partners : [];
  const investmentList = Array.isArray(investments) ? investments : [];
  const profitEventList = Array.isArray(profitEvents) ? profitEvents : [];

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalBudget = projectList.reduce((sum, p) => sum + (p.budget || 0), 0);
    const budgetUtilized = projectList.reduce((sum, p) => sum + (p.spent || 0), 0);
    const totalPOValue = poList.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalWOValue = woList.reduce((sum, w) => sum + (w.amount || 0), 0);
    const totalRAValue = raBillList.reduce((sum, r) => sum + (r.total || 0), 0);
    const totalStockValue = stockList.reduce((sum, s) => sum + ((s.quantity || 0) * (s.rate || 0)), 0);
    const totalInvestments = investmentList.reduce((sum, i) => sum + (i.totalContributions || 0), 0);

    return {
      totalBudget,
      budgetUtilized,
      budgetRemaining: totalBudget - budgetUtilized,
      budgetPercent: totalBudget > 0 ? (budgetUtilized / totalBudget) * 100 : 0,
      totalPOValue,
      totalWOValue,
      totalRAValue,
      totalStockValue,
      totalInvestments,
      totalProjects: projectList.length,
      activeProjects: projectList.filter(p => p.status === 'Active').length,
      completedProjects: projectList.filter(p => p.status === 'Completed').length,
      totalMRs: mrList.length,
      pendingMRs: mrList.filter(m => m.status === 'Pending' || m.status === 'Draft').length,
      totalPOs: poList.length,
      approvedPOs: poList.filter(p => p.status === 'Approved').length,
      totalWOs: woList.length,
      activeWOs: woList.filter(w => w.status === 'Active').length,
      totalSuppliers: supplierList.length,
      totalContractors: contractorList.length,
      lowStockItems: stockList.filter(s => (s.quantity || 0) < (s.reorderLevel || 10)).length,
      draftJournals: journalList.filter(j => j.status === 'Draft').length,
      totalPartners: partnerList.length,
      activeInvestments: investmentList.filter(i => i.active).length,
    };
  }, [projectList, poList, mrList, supplierList, woList, raBillList, stockList, contractorList, journalList, partnerList, investmentList]);

  // Chart data
  const projectStatusData = [
    { name: 'Planning', value: projectList.filter(p => p.status === 'Planning').length, color: '#3b82f6' },
    { name: 'Active', value: kpis.activeProjects, color: '#10b981' },
    { name: 'On Hold', value: projectList.filter(p => p.status === 'On Hold').length, color: '#f59e0b' },
    { name: 'Completed', value: kpis.completedProjects, color: '#6366f1' },
  ].filter(d => d.value > 0);

  const financialData = [
    { name: 'Budget', value: kpis.totalBudget },
    { name: 'Utilized', value: kpis.budgetUtilized },
    { name: 'POs', value: kpis.totalPOValue },
    { name: 'WOs', value: kpis.totalWOValue },
    { name: 'Stock', value: kpis.totalStockValue },
  ];

  const purchaseFlowData = [
    { stage: 'MRs', total: kpis.totalMRs, pending: kpis.pendingMRs, approved: kpis.totalMRs - kpis.pendingMRs },
    { stage: 'POs', total: kpis.totalPOs, pending: kpis.totalPOs - kpis.approvedPOs, approved: kpis.approvedPOs },
    { stage: 'WOs', total: kpis.totalWOs, pending: kpis.totalWOs - kpis.activeWOs, approved: kpis.activeWOs },
  ];

  // Recent activities
  const recentProjects = projectList.slice(0, 5);
  const recentPOs = poList.slice(0, 5);
  const recentWOs = woList.slice(0, 5);

  const quickActions = [
    { label: 'New Project', icon: Building2, path: '/engineering/projects/new', color: 'text-blue-600' },
    { label: 'Create MR', icon: Package, path: '/purchase/mrs/new', color: 'text-green-600' },
    { label: 'New PO', icon: ShoppingCart, path: '/purchase/pos/new', color: 'text-purple-600' },
    { label: 'Add Contractor', icon: Users, path: '/contracts/contractors/new', color: 'text-orange-600' },
    { label: 'Journal Entry', icon: Calculator, path: '/accounts/journals/new', color: 'text-indigo-600' },
    { label: 'Add Partner', icon: Briefcase, path: '/partners/list/new', color: 'text-pink-600' },
  ];

  const moduleCards = [
    { title: 'Engineering', icon: Building2, path: '/engineering', count: kpis.totalProjects, label: 'Projects', color: 'bg-blue-50 text-blue-600' },
    { title: 'Purchase', icon: ShoppingCart, path: '/purchase', count: kpis.totalPOs, label: 'Purchase Orders', color: 'bg-green-50 text-green-600' },
    { title: 'Contracts', icon: FileText, path: '/contracts', count: kpis.totalWOs, label: 'Work Orders', color: 'bg-purple-50 text-purple-600' },
    { title: 'Site & Inventory', icon: Warehouse, path: '/site', count: itemList.length, label: 'Items', color: 'bg-orange-50 text-orange-600' },
    { title: 'Accounts', icon: Calculator, path: '/accounts', count: journalList.length, label: 'Journals', color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Partners', icon: Briefcase, path: '/partners', count: kpis.totalPartners, label: 'Partners', color: 'bg-pink-50 text-pink-600' },
    { title: 'Workflow', icon: GitBranch, path: '/workflow', count: 0, label: 'Approvals', color: 'bg-cyan-50 text-cyan-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">ERP Dashboard</h1>
        <p className="text-muted-foreground mt-1">Comprehensive view across all modules</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => navigate(action.path)}
                className="h-auto flex-col gap-2 py-4"
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Budget"
          value={formatCurrency(kpis.totalBudget, 'short')}
          description={`${kpis.budgetPercent.toFixed(1)}% utilized`}
          icon={DollarSign}
          trend={{ value: kpis.budgetPercent, isPositive: kpis.budgetPercent < 90 }}
        />
        <KPICard
          title="Active Projects"
          value={kpis.activeProjects.toString()}
          description={`${kpis.totalProjects} total projects`}
          icon={Building2}
        />
        <KPICard
          title="Purchase Orders"
          value={kpis.totalPOs.toString()}
          description={`${kpis.approvedPOs} approved`}
          icon={ShoppingCart}
          trend={{ value: kpis.approvedPOs, isPositive: true }}
        />
        <KPICard
          title="Work Orders"
          value={kpis.totalWOs.toString()}
          description={`${kpis.activeWOs} active`}
          icon={Hammer}
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="PO Value"
          value={formatCurrency(kpis.totalPOValue, 'short')}
          description="Total purchase orders"
          icon={ShoppingCart}
        />
        <KPICard
          title="WO Value"
          value={formatCurrency(kpis.totalWOValue, 'short')}
          description="Total work orders"
          icon={FileText}
        />
        <KPICard
          title="Stock Value"
          value={formatCurrency(kpis.totalStockValue, 'short')}
          description={`${kpis.lowStockItems} low stock items`}
          icon={Warehouse}
          trend={{ value: kpis.lowStockItems, isPositive: kpis.lowStockItems === 0 }}
        />
        <KPICard
          title="Investments"
          value={formatCurrency(kpis.totalInvestments, 'short')}
          description={`${kpis.activeInvestments} active`}
          icon={TrendingUp}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No project data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Purchase Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase & Contracts Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purchaseFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpis.pendingMRs > 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100" onClick={() => navigate('/purchase/mrs')}>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-sm">Pending MRs</p>
                    <p className="text-xs text-muted-foreground">{kpis.pendingMRs} material requests awaiting approval</p>
                  </div>
                </div>
                <Badge variant="secondary">{kpis.pendingMRs}</Badge>
              </div>
            )}
            {kpis.lowStockItems > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100" onClick={() => navigate('/site/stock')}>
                <div className="flex items-center gap-3">
                  <Warehouse className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">Low Stock Alert</p>
                    <p className="text-xs text-muted-foreground">{kpis.lowStockItems} items below reorder level</p>
                  </div>
                </div>
                <Badge variant="destructive">{kpis.lowStockItems}</Badge>
              </div>
            )}
            {kpis.draftJournals > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100" onClick={() => navigate('/accounts/journals')}>
                <div className="flex items-center gap-3">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Draft Journals</p>
                    <p className="text-xs text-muted-foreground">{kpis.draftJournals} journal entries to be posted</p>
                  </div>
                </div>
                <Badge variant="secondary">{kpis.draftJournals}</Badge>
              </div>
            )}
            {kpis.pendingMRs === 0 && kpis.lowStockItems === 0 && kpis.draftJournals === 0 && (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All clear! No pending alerts.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Overview Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {moduleCards.map((module, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow border-t-4 hover:border-t-primary"
                onClick={() => navigate(module.path)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`inline-flex p-3 rounded-lg mb-2 ${module.color}`}>
                    <module.icon className="h-6 w-6" />
                  </div>
                  <p className="font-semibold text-sm">{module.title}</p>
                  <p className="text-2xl font-bold mt-1">{module.count}</p>
                  <p className="text-xs text-muted-foreground">{module.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Projects</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/engineering/projects')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/engineering/projects/${project.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.code}</p>
                    </div>
                    <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No projects yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent POs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent POs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/purchase/pos')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentPOs.length > 0 ? (
              <div className="space-y-3">
                {recentPOs.map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/purchase/pos/${po.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{po.code}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(po.totalAmount || 0)}</p>
                    </div>
                    <Badge variant={po.status === 'Approved' ? 'default' : 'secondary'}>
                      {po.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No purchase orders yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Work Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Work Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/contracts/work-orders')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentWOs.length > 0 ? (
              <div className="space-y-3">
                {recentWOs.map((wo) => (
                  <div
                    key={wo.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/contracts/work-orders/${wo.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{wo.code}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(wo.amount || 0)}</p>
                    </div>
                    <Badge variant={wo.status === 'Active' ? 'default' : 'secondary'}>
                      {wo.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No work orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
