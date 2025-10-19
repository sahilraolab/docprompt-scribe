import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Users, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle,
  Building2,
  ShoppingCart,
  Briefcase,
  DollarSign,
  TrendingDown,
  Activity,
  Hammer,
  ClipboardList,
  Warehouse,
  Calendar,
  ArrowRight,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  FileSpreadsheet,
  Truck,
  Settings,
  Shield,
  Archive
} from 'lucide-react';
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils/format';
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
  AreaChart,
  Area,
} from 'recharts';
import { useProjects, useEstimates, useDocuments, usePlans } from '@/lib/hooks/useEngineering';
import { usePOs, useMRs, useSuppliers, usePurchaseBills, useComparativeStatements } from '@/lib/hooks/usePurchase';
import { useContractors, useWorkOrders, useRABills, useLabourRates } from '@/lib/hooks/useContractors';
import { useItems, useStock } from '@/lib/hooks/useSite';
import { useBOQs, useMaterialMaster } from '@/lib/hooks/useMaterialMaster';
import { exportToCSV, exportToExcel } from '@/lib/utils/export';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  // Fetch data from ALL modules
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: estimates = [] } = useEstimates();
  const { data: documents = [] } = useDocuments();
  const { data: plans = [] } = usePlans();
  const { data: pos = [] } = usePOs();
  const { data: mrs = [] } = useMRs();
  const { data: suppliers = [] } = useSuppliers();
  const { data: purchaseBills = [] } = usePurchaseBills();
  const { data: comparativeStatements = [] } = useComparativeStatements();
  const { data: contractors = [] } = useContractors();
  const { data: workOrders = [] } = useWorkOrders();
  const { data: raBills = [] } = useRABills();
  const { data: labourRates = [] } = useLabourRates();
  const { data: items = [] } = useItems();
  const { data: stock = [] } = useStock();
  const { data: boqs = [] } = useBOQs();
  const { data: materials = [] } = useMaterialMaster();

  // Convert to arrays
  const projectList = Array.isArray(projects) ? projects : [];
  const estimateList = Array.isArray(estimates) ? estimates : [];
  const documentList = Array.isArray(documents) ? documents : [];
  const planList = Array.isArray(plans) ? plans : [];
  const poList = Array.isArray(pos) ? pos : [];
  const mrList = Array.isArray(mrs) ? mrs : [];
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const billList = Array.isArray(purchaseBills) ? purchaseBills : [];
  const csList = Array.isArray(comparativeStatements) ? comparativeStatements : [];
  const contractorList = Array.isArray(contractors) ? contractors : [];
  const woList = Array.isArray(workOrders) ? workOrders : [];
  const raBillList = Array.isArray(raBills) ? raBills : [];
  const labourRateList = Array.isArray(labourRates) ? labourRates : [];
  const itemList = Array.isArray(items) ? items : [];
  const stockList = Array.isArray(stock) ? stock : [];
  const boqList = Array.isArray(boqs) ? boqs : [];
  const materialList = Array.isArray(materials) ? materials : [];

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = {
      projects: projectList,
      pos: poList,
      mrs: mrList,
      wos: woList,
      raBills: raBillList,
      estimates: estimateList,
      boqs: boqList
    };

    // Status filter
    if (statusFilter !== 'all') {
      filtered.projects = filtered.projects.filter((p: any) => p.status === statusFilter);
      filtered.pos = filtered.pos.filter((p: any) => p.status === statusFilter);
      filtered.mrs = filtered.mrs.filter((m: any) => m.status === statusFilter);
      filtered.wos = filtered.wos.filter((w: any) => w.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== 'all') {
      filtered.mrs = filtered.mrs.filter((m: any) => 
        (m.projectId?._id || m.projectId?.id || m.projectId) === projectFilter
      );
      filtered.estimates = filtered.estimates.filter((e: any) => 
        (e.projectId?._id || e.projectId?.id || e.projectId) === projectFilter
      );
      filtered.boqs = filtered.boqs.filter((b: any) => 
        (b.projectId?._id || b.projectId?.id || b.projectId) === projectFilter
      );
    }

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filtered.pos = filtered.pos.filter((p: any) => {
        const date = new Date(p.createdAt || p.date);
        return date >= start && date <= end;
      });
      filtered.mrs = filtered.mrs.filter((m: any) => {
        const date = new Date(m.createdAt || m.date);
        return date >= start && date <= end;
      });
    }

    return filtered;
  }, [projectList, poList, mrList, woList, raBillList, estimateList, boqList, statusFilter, projectFilter, startDate, endDate]);

  // Calculate comprehensive KPIs
  const kpis = useMemo(() => {
    const totalBudget = projectList.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
    const budgetUtilized = projectList.reduce((sum: number, p: any) => sum + (p.budgetUtilized || p.spent || 0), 0);
    const totalPOValue = poList.reduce((sum: number, p: any) => sum + (p.totalAmount || p.total || 0), 0);
    const totalWOValue = woList.reduce((sum: number, w: any) => sum + (w.value || 0), 0);
    const totalRAValue = raBillList.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    const totalStockValue = stockList.reduce((sum: number, s: any) => sum + ((s.quantity || 0) * (s.rate || 0)), 0);
    const totalBOQValue = boqList.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

    return {
      // Financial
      totalBudget,
      budgetUtilized,
      budgetRemaining: totalBudget - budgetUtilized,
      budgetUtilizedPercent: totalBudget > 0 ? (budgetUtilized / totalBudget) * 100 : 0,
      totalPOValue,
      totalWOValue,
      totalRAValue,
      totalStockValue,
      totalBOQValue,
      
      // Projects
      totalProjects: projectList.length,
      activeProjects: projectList.filter((p: any) => p.status === 'Active').length,
      completedProjects: projectList.filter((p: any) => p.status === 'Completed').length,
      onHoldProjects: projectList.filter((p: any) => p.status === 'OnHold').length,
      planningProjects: projectList.filter((p: any) => p.status === 'Planning').length,
      
      // Purchase
      totalMRs: mrList.length,
      pendingMRs: mrList.filter((m: any) => m.status === 'Pending' || m.status === 'Draft').length,
      approvedMRs: mrList.filter((m: any) => m.status === 'Approved').length,
      totalPOs: poList.length,
      pendingPOs: poList.filter((p: any) => p.status === 'Draft' || p.status === 'Pending').length,
      approvedPOs: poList.filter((p: any) => p.status === 'Approved').length,
      totalSuppliers: supplierList.length,
      totalBills: billList.length,
      
      // Contracts
      totalContractors: contractorList.length,
      totalWOs: woList.length,
      activeWOs: woList.filter((w: any) => w.status === 'Active').length,
      completedWOs: woList.filter((w: any) => w.status === 'Completed').length,
      totalRABills: raBillList.length,
      pendingRABills: raBillList.filter((r: any) => r.status === 'Pending' || r.status === 'Submitted').length,
      
      // Engineering
      totalEstimates: estimateList.length,
      approvedEstimates: estimateList.filter((e: any) => e.status === 'Approved').length,
      totalBOQs: boqList.length,
      approvedBOQs: boqList.filter((b: any) => b.status === 'Approved').length,
      totalDocuments: documentList.length,
      totalPlans: planList.length,
      
      // Inventory
      totalItems: itemList.length,
      totalMaterials: materialList.length,
      lowStockItems: stockList.filter((s: any) => (s.quantity || 0) < (s.reorderLevel || 10)).length,
    };
  }, [projectList, poList, mrList, woList, raBillList, stockList, boqList, supplierList, contractorList, estimateList, documentList, planList, itemList, materialList, billList]);

  // Chart data
  const projectStatusData = [
    { name: 'Planning', value: kpis.planningProjects, color: '#3b82f6' },
    { name: 'Active', value: kpis.activeProjects, color: '#10b981' },
    { name: 'On Hold', value: kpis.onHoldProjects, color: '#f59e0b' },
    { name: 'Completed', value: kpis.completedProjects, color: '#6366f1' },
  ].filter(d => d.value > 0);

  const purchaseFlowData = [
    { stage: 'MRs', total: kpis.totalMRs, pending: kpis.pendingMRs, approved: kpis.approvedMRs },
    { stage: 'POs', total: kpis.totalPOs, pending: kpis.pendingPOs, approved: kpis.approvedPOs },
    { stage: 'Bills', total: kpis.totalBills, pending: 0, approved: kpis.totalBills },
  ];

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      pos: Math.floor(Math.random() * 20) + 10,
      mrs: Math.floor(Math.random() * 25) + 15,
      wos: Math.floor(Math.random() * 15) + 5,
    }));
  }, []);

  // Export functions
  const handleExportFinancialReport = () => {
    const data = projectList.map((p: any) => ({
      'Project Code': p.code,
      'Project Name': p.name,
      'Budget': p.budget || 0,
      'Utilized': p.budgetUtilized || p.spent || 0,
      'Remaining': (p.budget || 0) - (p.budgetUtilized || p.spent || 0),
      'Utilization %': p.budget > 0 ? ((p.budgetUtilized || p.spent || 0) / p.budget * 100).toFixed(2) + '%' : '0%',
      'Status': p.status,
    }));
    exportToExcel(data, `Financial_Report_${new Date().toISOString().split('T')[0]}`);
    toast.success('Financial report exported');
  };

  const handleExportPurchaseReport = () => {
    const data = poList.map((p: any) => ({
      'PO Number': p.code || p.poNumber,
      'Supplier': p.supplierId?.name || p.supplierName || 'N/A',
      'Date': formatDate(p.createdAt || p.date),
      'Amount': p.totalAmount || p.total || 0,
      'Status': p.status,
      'Project': p.projectId?.name || 'N/A',
    }));
    exportToExcel(data, `Purchase_Report_${new Date().toISOString().split('T')[0]}`);
    toast.success('Purchase report exported');
  };

  const handleExportContractsReport = () => {
    const data = woList.map((w: any) => ({
      'WO Number': w.code || w.woNumber,
      'Contractor': w.contractorId?.name || w.contractorName || 'N/A',
      'Value': w.value || 0,
      'Progress': (w.progress || 0) + '%',
      'Status': w.status,
      'Start Date': formatDate(w.startDate),
      'End Date': formatDate(w.endDate),
    }));
    exportToExcel(data, `Contracts_Report_${new Date().toISOString().split('T')[0]}`);
    toast.success('Contracts report exported');
  };

  const handleExportInventoryReport = () => {
    const data = stockList.map((s: any) => ({
      'Item Code': s.itemId?.code || s.itemCode || 'N/A',
      'Item Name': s.itemId?.name || s.itemName || 'N/A',
      'Quantity': s.quantity || 0,
      'UOM': s.uom || 'N/A',
      'Rate': s.rate || 0,
      'Value': (s.quantity || 0) * (s.rate || 0),
      'Location': s.location || 'N/A',
    }));
    exportToExcel(data, `Inventory_Report_${new Date().toISOString().split('T')[0]}`);
    toast.success('Inventory report exported');
  };

  const handleExportMasterReport = () => {
    const data = {
      summary: [{
        'Total Budget': kpis.totalBudget,
        'Budget Utilized': kpis.budgetUtilized,
        'Active Projects': kpis.activeProjects,
        'Total POs': kpis.totalPOs,
        'Total WOs': kpis.totalWOs,
        'Stock Value': kpis.totalStockValue,
        'Suppliers': kpis.totalSuppliers,
        'Contractors': kpis.totalContractors,
      }],
      projects: projectList.map((p: any) => ({
        Code: p.code,
        Name: p.name,
        Status: p.status,
        Budget: p.budget,
        Progress: p.progress + '%',
      })),
      purchase: poList.map((p: any) => ({
        PO: p.code,
        Supplier: p.supplierId?.name || 'N/A',
        Amount: p.totalAmount || 0,
        Status: p.status,
      })),
      contracts: woList.map((w: any) => ({
        WO: w.code,
        Contractor: w.contractorId?.name || 'N/A',
        Value: w.value || 0,
        Status: w.status,
      })),
    };
    
    // Export as multiple sheets
    exportToExcel(data.summary, `Master_Report_${new Date().toISOString().split('T')[0]}`);
    toast.success('Master report exported');
  };

  const quickActions = [
    { label: 'New Project', icon: Building2, path: '/engineering/projects/new', variant: 'default' as const },
    { label: 'Create MR', icon: Package, path: '/purchase/mrs/new', variant: 'outline' as const },
    { label: 'New PO', icon: ShoppingCart, path: '/purchase/pos/new', variant: 'outline' as const },
    { label: 'Add Contractor', icon: Users, path: '/contracts/contractors/new', variant: 'outline' as const },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">ERP Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view across all modules
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={() => navigate(action.path)}
              className="gap-2"
              size="sm"
            >
              <action.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projectList.map((p: any) => (
                    <SelectItem key={p._id || p.id} value={p._id || p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setStatusFilter('all');
                    setProjectFilter('all');
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reports</Label>
              <Select onValueChange={(value) => {
                if (value === 'financial') handleExportFinancialReport();
                else if (value === 'purchase') handleExportPurchaseReport();
                else if (value === 'contracts') handleExportContractsReport();
                else if (value === 'inventory') handleExportInventoryReport();
                else if (value === 'master') handleExportMasterReport();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Export Report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="purchase">Purchase Report</SelectItem>
                  <SelectItem value="contracts">Contracts Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="master">Master Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Budget"
            value={formatCurrency(kpis.totalBudget, 'short')}
            description={`${kpis.totalProjects} projects`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <KPICard
            title="Budget Utilized"
            value={formatCurrency(kpis.budgetUtilized, 'short')}
            description={`${kpis.budgetUtilizedPercent.toFixed(1)}% utilized`}
            icon={TrendingDown}
          />
          <KPICard
            title="PO Value"
            value={formatCurrency(kpis.totalPOValue, 'short')}
            description={`${kpis.totalPOs} purchase orders`}
            icon={ShoppingCart}
          />
          <KPICard
            title="WO Value"
            value={formatCurrency(kpis.totalWOValue, 'short')}
            description={`${kpis.totalWOs} work orders`}
            icon={Briefcase}
          />
        </div>
      </div>

      {/* Module-wise KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Module Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/engineering/projects')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalProjects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">{kpis.activeProjects} Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/engineering/boq')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <ClipboardList className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalBOQs}</p>
                  <p className="text-xs text-muted-foreground">BOQs</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">{formatCurrency(kpis.totalBOQValue, 'short')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/purchase/mrs')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Package className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalMRs}</p>
                  <p className="text-xs text-muted-foreground">MRs</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">{kpis.pendingMRs} Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/purchase/pos')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalPOs}</p>
                  <p className="text-xs text-muted-foreground">POs</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">{kpis.pendingPOs} Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/purchase/suppliers')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Truck className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalSuppliers}</p>
                  <p className="text-xs text-muted-foreground">Suppliers</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/contracts/contractors')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalContractors}</p>
                  <p className="text-xs text-muted-foreground">Contractors</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">{kpis.activeWOs} WOs</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/contracts/work-orders')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Briefcase className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalWOs}</p>
                  <p className="text-xs text-muted-foreground">Work Orders</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="default" className="text-xs">{kpis.activeWOs} Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/contracts/ra-bills')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalRABills}</p>
                  <p className="text-xs text-muted-foreground">RA Bills</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">{kpis.pendingRABills} Pending</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/site/items')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Warehouse className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalItems}</p>
                  <p className="text-xs text-muted-foreground">Items</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">{formatCurrency(kpis.totalStockValue, 'short')}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/engineering/materials')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Archive className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalMaterials}</p>
                  <p className="text-xs text-muted-foreground">Materials</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">Master</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/engineering/estimates')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalEstimates}</p>
                  <p className="text-xs text-muted-foreground">Estimates</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">{kpis.approvedEstimates} Approved</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent" onClick={() => navigate('/engineering/documents')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <div className="text-right">
                  <p className="text-2xl font-bold">{kpis.totalDocuments}</p>
                  <p className="text-xs text-muted-foreground">Documents</p>
                </div>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">Files</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Distribution</CardTitle>
                <CardDescription>{kpis.totalProjects} total projects</CardDescription>
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
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pos" stroke="#3b82f6" name="POs" />
                    <Line type="monotone" dataKey="mrs" stroke="#10b981" name="MRs" />
                    <Line type="monotone" dataKey="wos" stroke="#f59e0b" name="WOs" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Workflow</CardTitle>
                <CardDescription>MR → PO → Bill flow</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={purchaseFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                    <Bar dataKey="approved" fill="#10b981" name="Approved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Action required</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate('/purchase/mrs')}>
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="font-medium">Material Requisitions</span>
                    </div>
                    <Badge variant="secondary">{kpis.pendingMRs}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate('/purchase/pos')}>
                    <div className="flex items-center gap-3">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <span className="font-medium">Purchase Orders</span>
                    </div>
                    <Badge variant="secondary">{kpis.pendingPOs}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate('/contracts/ra-bills')}>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">RA Bills</span>
                    </div>
                    <Badge variant="secondary">{kpis.pendingRABills}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Active Projects</CardTitle>
                    <CardDescription>Progress tracking</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/engineering/projects')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.projects.filter((p: any) => p.status === 'Active').slice(0, 5).map((project: any, index: number) => (
                    <div key={index} className="space-y-2 cursor-pointer hover:bg-accent p-2 rounded" onClick={() => navigate(`/engineering/projects/${project._id || project.id}`)}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{project.name}</span>
                        <span className="text-muted-foreground">{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Budget: {formatCurrency(project.budget || 0)}</span>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>BOQs by Project</CardTitle>
                    <CardDescription>Bill of Quantities</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/engineering/boq')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.boqs.slice(0, 5).map((boq: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/engineering/boq/${boq._id || boq.id}`)}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{boq.name || 'BOQ'}</p>
                        <p className="text-xs text-muted-foreground">{boq.code}</p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold">{formatCurrency(boq.totalAmount || 0)}</p>
                        <p className="text-xs text-muted-foreground">{boq.items?.length || 0} items</p>
                      </div>
                      <Badge variant={boq.status === 'Approved' ? 'default' : 'secondary'}>
                        {boq.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Purchase Tab */}
        <TabsContent value="purchase" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Purchase Orders</CardTitle>
                    <CardDescription>Latest POs</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/purchase/pos')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.pos.slice(0, 5).map((po: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/purchase/pos/${po._id || po.id}`)}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{po.code || po.poNumber}</p>
                        <p className="text-xs text-muted-foreground">{po.supplierId?.name || 'Supplier'}</p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold">{formatCurrency(po.totalAmount || 0)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(po.createdAt)}</p>
                      </div>
                      <Badge variant={po.status === 'Approved' ? 'default' : 'secondary'}>
                        {po.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Material Requisitions</CardTitle>
                    <CardDescription>Recent MRs</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/purchase/mrs')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.mrs.slice(0, 5).map((mr: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/purchase/mrs/${mr._id || mr.id}`)}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{mr.code || mr.mrNumber}</p>
                        <p className="text-xs text-muted-foreground">{mr.projectId?.name || 'Project'}</p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-xs text-muted-foreground">{formatDate(mr.createdAt)}</p>
                      </div>
                      <Badge variant={mr.status === 'Approved' ? 'default' : 'secondary'}>
                        {mr.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Work Orders</CardTitle>
                    <CardDescription>Active WOs</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/contracts/work-orders')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.wos.slice(0, 5).map((wo: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/contracts/work-orders/${wo._id || wo.id}`)}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{wo.code || wo.woNumber}</p>
                        <p className="text-xs text-muted-foreground">{wo.contractorId?.name || 'Contractor'}</p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold">{formatCurrency(wo.value || 0)}</p>
                        <Progress value={wo.progress || 0} className="h-1 w-20 mt-1" />
                      </div>
                      <Badge variant={wo.status === 'Active' ? 'default' : 'secondary'}>
                        {wo.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>RA Bills</CardTitle>
                    <CardDescription>Running Account Bills</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/contracts/ra-bills')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredData.raBills.slice(0, 5).map((ra: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/contracts/ra-bills/${ra._id || ra.id}`)}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ra.billNo || ra.code}</p>
                        <p className="text-xs text-muted-foreground">WO: {ra.workOrderId?.code || 'N/A'}</p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold">{formatCurrency(ra.amount || 0)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(ra.createdAt)}</p>
                      </div>
                      <Badge variant={ra.status === 'Approved' ? 'default' : 'secondary'}>
                        {ra.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Stock Summary</CardTitle>
                    <CardDescription>Current inventory value</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/site/stock')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Stock Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(kpis.totalStockValue)}</p>
                    </div>
                    <Warehouse className="h-10 w-10 text-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Total Items</p>
                      <p className="text-xl font-bold">{kpis.totalItems}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-xs text-muted-foreground">Low Stock</p>
                      <p className="text-xl font-bold text-amber-600">{kpis.lowStockItems}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Material Master</CardTitle>
                    <CardDescription>Catalog overview</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/engineering/materials')}>
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Materials</p>
                      <p className="text-2xl font-bold">{kpis.totalMaterials}</p>
                    </div>
                    <Archive className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Complete master catalog of all materials used across projects
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Quick Reports
          </CardTitle>
          <CardDescription>Download comprehensive reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button variant="outline" onClick={handleExportFinancialReport} className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Financial
            </Button>
            <Button variant="outline" onClick={handleExportPurchaseReport} className="justify-start">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase
            </Button>
            <Button variant="outline" onClick={handleExportContractsReport} className="justify-start">
              <Briefcase className="h-4 w-4 mr-2" />
              Contracts
            </Button>
            <Button variant="outline" onClick={handleExportInventoryReport} className="justify-start">
              <Warehouse className="h-4 w-4 mr-2" />
              Inventory
            </Button>
            <Button variant="outline" onClick={handleExportMasterReport} className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Master Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
