import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  PieChart as PieChartIcon,
  BarChart3
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
import { useProjects } from '@/lib/hooks/useEngineering';
import { usePOs, useMRs, useSuppliers } from '@/lib/hooks/usePurchase';
import { useContractors, useWorkOrders, useRABills } from '@/lib/hooks/useContractors';
import { useItems, useStock } from '@/lib/hooks/useSite';
import { useBOQs, useMaterialMaster } from '@/lib/hooks/useMaterialMaster';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch real data from all modules
  const { data: projects = [] } = useProjects();
  const { data: pos = [] } = usePOs();
  const { data: mrs = [] } = useMRs();
  const { data: suppliers = [] } = useSuppliers();
  const { data: contractors = [] } = useContractors();
  const { data: workOrders = [] } = useWorkOrders();
  const { data: raBills = [] } = useRABills();
  const { data: items = [] } = useItems();
  const { data: stock = [] } = useStock();
  const { data: boqs = [] } = useBOQs();
  const { data: materials = [] } = useMaterialMaster();

  // Calculate real KPIs
  const projectList = Array.isArray(projects) ? projects : [];
  const poList = Array.isArray(pos) ? pos : [];
  const mrList = Array.isArray(mrs) ? mrs : [];
  const contractorList = Array.isArray(contractors) ? contractors : [];
  const boqList = Array.isArray(boqs) ? boqs : [];
  const woList = Array.isArray(workOrders) ? workOrders : [];
  const raBillList = Array.isArray(raBills) ? raBills : [];
  
  const totalBudget = projectList.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
  const budgetUtilized = projectList.reduce((sum: number, p: any) => sum + (p.budgetUtilized || p.spent || 0), 0);
  const activeProjects = projectList.filter((p: any) => p.status === 'Active').length;
  const pendingMRs = mrList.filter((mr: any) => mr.status === 'Pending' || mr.status === 'Draft').length;
  const pendingPOs = poList.filter((po: any) => po.status === 'Draft' || po.status === 'Pending').length;
  const pendingWOs = woList.filter((wo: any) => wo.status === 'Draft' || wo.status === 'Pending').length;
  const pendingRABills = raBillList.filter((ra: any) => ra.status === 'Pending' || ra.status === 'Submitted').length;
  
  const totalStockValue = (Array.isArray(stock) ? stock : []).reduce((sum: number, s: any) => 
    sum + ((s.quantity || 0) * (s.rate || 0)), 0
  );

  // Project status distribution
  const projectStatusData = [
    { name: 'Planning', value: projectList.filter((p: any) => p.status === 'Planning').length, color: '#3b82f6' },
    { name: 'Active', value: projectList.filter((p: any) => p.status === 'Active').length, color: '#10b981' },
    { name: 'OnHold', value: projectList.filter((p: any) => p.status === 'OnHold').length, color: '#f59e0b' },
    { name: 'Completed', value: projectList.filter((p: any) => p.status === 'Completed').length, color: '#6366f1' },
  ].filter(d => d.value > 0);

  // Recent projects for progress tracking
  const recentProjects = projectList
    .filter((p: any) => p.status === 'Active')
    .slice(0, 5)
    .map((p: any) => ({
      name: p.name,
      progress: p.progress || 0,
      budget: p.budget || 0,
      spent: p.budgetUtilized || p.spent || 0
    }));

  // Purchase workflow stats
  const purchaseFlowData = [
    { stage: 'MRs', count: mrList.length, pending: pendingMRs },
    { stage: 'Quotations', count: 0, pending: 0 },
    { stage: 'POs', count: poList.length, pending: pendingPOs },
    { stage: 'GRNs', count: 0, pending: 0 },
  ];

  // Quick actions
  const quickActions = [
    { label: 'New Project', icon: Building2, path: '/engineering/projects/new', variant: 'default' as const },
    { label: 'Create MR', icon: Package, path: '/purchase/mrs/new', variant: 'outline' as const },
    { label: 'New PO', icon: ShoppingCart, path: '/purchase/pos/new', variant: 'outline' as const },
    { label: 'Add Contractor', icon: Users, path: '/contracts/contractors/new', variant: 'outline' as const },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {activeProjects} Active Projects • {suppliers.length} Suppliers • {contractorList.length} Contractors
          </p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={() => navigate(action.path)}
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row 1 - Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Budget"
          value={formatCurrency(totalBudget, 'short')}
          description={`${projectList.length} projects`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Budget Utilized"
          value={formatCurrency(budgetUtilized, 'short')}
          description={`${totalBudget > 0 ? ((budgetUtilized/totalBudget)*100).toFixed(0) : 0}% of total`}
          icon={TrendingDown}
        />
        <KPICard
          title="Stock Value"
          value={formatCurrency(totalStockValue, 'short')}
          description={`${items.length} items tracked`}
          icon={Package}
        />
        <KPICard
          title="Active BOQs"
          value={boqList.filter((b: any) => b.status === 'Approved').length.toString()}
          description={`${boqList.length} total BOQs`}
          icon={ClipboardList}
        />
      </div>

      {/* KPI Cards Row 2 - Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Projects"
          value={activeProjects.toString()}
          description={`${projectList.length} total projects`}
          icon={Building2}
          trend={{ value: 18, isPositive: true }}
        />
        <KPICard
          title="Contractors"
          value={contractorList.length.toString()}
          description={`${woList.length} work orders`}
          icon={Users}
        />
        <KPICard
          title="Pending Approvals"
          value={(pendingMRs + pendingPOs + pendingWOs + pendingRABills).toString()}
          description="Requires action"
          icon={AlertCircle}
        />
        <KPICard
          title="Materials"
          value={materials.length.toString()}
          description="In master catalog"
          icon={Warehouse}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>{projectList.length} total projects</CardDescription>
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
                    No project data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Items awaiting action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate('/purchase/mrs')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Material Requisitions</p>
                        <p className="text-sm text-muted-foreground">Pending approval</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{pendingMRs}</p>
                      <p className="text-xs text-muted-foreground">pending</p>
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate('/purchase/pos')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Purchase Orders</p>
                        <p className="text-sm text-muted-foreground">Pending approval</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{pendingPOs}</p>
                      <p className="text-xs text-muted-foreground">pending</p>
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate('/contracts/work-orders')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Work Orders</p>
                        <p className="text-sm text-muted-foreground">Pending approval</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{pendingWOs}</p>
                      <p className="text-xs text-muted-foreground">pending</p>
                    </div>
                  </div>

                  <div 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => navigate('/contracts/ra-bills')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">RA Bills</p>
                        <p className="text-sm text-muted-foreground">Pending approval</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{pendingRABills}</p>
                      <p className="text-xs text-muted-foreground">pending</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Project Progress</CardTitle>
                  <CardDescription>Top 5 projects by activity</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/engineering/projects')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.length > 0 ? (
                    recentProjects.map((project: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium truncate">{project.name}</span>
                          <span className="text-muted-foreground">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Budget: {formatCurrency(project.budget)}</span>
                          <span>Spent: {formatCurrency(project.spent)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No active projects
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project-BOQ Relationship */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>BOQs by Project</CardTitle>
                  <CardDescription>Bill of Quantities status</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/engineering/boq')}>
                  View BOQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {boqList.slice(0, 5).map((boq: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => navigate(`/engineering/boq/${boq._id || boq.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{boq.name || boq.projectId?.name || 'BOQ'}</p>
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
                  {boqList.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No BOQs created yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Purchase Tab */}
        <TabsContent value="purchase" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase Workflow */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Workflow</CardTitle>
                <CardDescription>MR → Quotation → PO → GRN</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={purchaseFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Total" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Purchase Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Purchase Orders</CardTitle>
                  <CardDescription>Latest POs</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/purchase/pos')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {poList.slice(0, 5).map((po: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => navigate(`/purchase/pos/${po._id || po.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{po.code || po.poNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {po.supplierId?.name || po.supplierName || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold">{formatCurrency(po.totalAmount || po.total || 0)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(po.createdAt)}</p>
                      </div>
                      <Badge variant={
                        po.status === 'Approved' ? 'default' : 
                        po.status === 'Pending' ? 'secondary' : 'outline'
                      }>
                        {po.status}
                      </Badge>
                    </div>
                  ))}
                  {poList.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No purchase orders yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suppliers Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Suppliers</CardTitle>
                <CardDescription>{suppliers.length} active suppliers</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/purchase/suppliers')}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suppliers.slice(0, 6).map((supplier: any, index: number) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/purchase/suppliers/${supplier._id || supplier.id}`)}
                  >
                    <p className="font-medium">{supplier.name}</p>
                    <p className="text-sm text-muted-foreground">{supplier.category || 'General'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{supplier.contactPerson || 'N/A'}</Badge>
                    </div>
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    No suppliers added yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Work Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Work Orders</CardTitle>
                  <CardDescription>{woList.length} work orders</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/contracts/work-orders')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {woList.slice(0, 5).map((wo: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => navigate(`/contracts/work-orders/${wo._id || wo.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{wo.code || wo.woNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {wo.contractorId?.name || wo.contractorName || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold">{formatCurrency(wo.value || 0)}</p>
                        <Progress value={wo.progress || 0} className="h-1 w-20 mt-1" />
                      </div>
                      <Badge variant={
                        wo.status === 'Active' ? 'default' : 
                        wo.status === 'Completed' ? 'outline' : 'secondary'
                      }>
                        {wo.status}
                      </Badge>
                    </div>
                  ))}
                  {woList.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No work orders yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* RA Bills */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent RA Bills</CardTitle>
                  <CardDescription>Running Account bills</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/contracts/ra-bills')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {raBillList.slice(0, 5).map((ra: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => navigate(`/contracts/ra-bills/${ra._id || ra.id}`)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ra.billNo || ra.code}</p>
                        <p className="text-xs text-muted-foreground">
                          {ra.workOrderId?.code || 'WO'}
                        </p>
                      </div>
                      <div className="text-right mr-3">
                        <p className="text-sm font-semibold">{formatCurrency(ra.amount || 0)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(ra.createdAt)}</p>
                      </div>
                      <Badge variant={
                        ra.status === 'Approved' ? 'default' : 
                        ra.status === 'Pending' ? 'secondary' : 'outline'
                      }>
                        {ra.status}
                      </Badge>
                    </div>
                  ))}
                  {raBillList.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No RA bills yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contractors Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Contractors</CardTitle>
                <CardDescription>{contractorList.length} contractors</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/contracts/contractors')}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contractorList.slice(0, 6).map((contractor: any, index: number) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => navigate(`/contracts/contractors/${contractor._id || contractor.id}`)}
                  >
                    <p className="font-medium">{contractor.name}</p>
                    <p className="text-sm text-muted-foreground">{contractor.type || 'General'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={contractor.status === 'Active' ? 'default' : 'secondary'}>
                        {contractor.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {contractorList.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-muted-foreground">
                    No contractors added yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all modules</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/notifications')}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mrList.length > 0 && (
              <div className="flex items-start gap-3 p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">New Material Requisition</p>
                  <p className="text-sm text-muted-foreground">
                    {mrList[mrList.length - 1]?.code} from {mrList[mrList.length - 1]?.projectId?.name || 'Project'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(mrList[mrList.length - 1]?.createdAt)}
                  </p>
                </div>
              </div>
            )}

            {poList.length > 0 && poList[poList.length - 1]?.status === 'Approved' && (
              <div className="flex items-start gap-3 p-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Purchase Order Approved</p>
                  <p className="text-sm text-muted-foreground">
                    {poList[poList.length - 1]?.code} for {poList[poList.length - 1]?.supplierId?.name || 'Supplier'} - {formatCurrency(poList[poList.length - 1]?.totalAmount || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(poList[poList.length - 1]?.updatedAt)}
                  </p>
                </div>
              </div>
            )}

            {projectList.length > 0 && (
              <div className="flex items-start gap-3 p-4 border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Project Update</p>
                  <p className="text-sm text-muted-foreground">
                    {projectList[0]?.name} - {projectList[0]?.progress || 0}% completed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(projectList[0]?.updatedAt)}
                  </p>
                </div>
              </div>
            )}

            {pendingRABills > 0 && (
              <div className="flex items-start gap-3 p-4 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">RA Bills Pending</p>
                  <p className="text-sm text-muted-foreground">
                    {pendingRABills} RA bill{pendingRABills > 1 ? 's' : ''} awaiting approval
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Requires action</p>
                </div>
              </div>
            )}

            {mrList.length === 0 && poList.length === 0 && projectList.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
