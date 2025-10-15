import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Users, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  ShoppingCart,
  Briefcase,
  DollarSign,
  TrendingDown,
  Activity
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
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

export default function Dashboard() {
  const navigate = useNavigate();

  // Enhanced mock data
  const projectStatusData = [
    { name: 'Planning', value: 2, color: '#3b82f6' },
    { name: 'Active', value: 5, color: '#10b981' },
    { name: 'On Hold', value: 1, color: '#f59e0b' },
    { name: 'Completed', value: 3, color: '#6366f1' },
  ];

  const monthlyExpenses = [
    { month: 'Jan', materials: 450, labour: 380, equipment: 120 },
    { month: 'Feb', materials: 520, labour: 420, equipment: 150 },
    { month: 'Mar', materials: 480, labour: 400, equipment: 130 },
    { month: 'Apr', materials: 600, labour: 450, equipment: 180 },
    { month: 'May', materials: 550, labour: 430, equipment: 160 },
    { month: 'Jun', materials: 580, labour: 460, equipment: 170 },
  ];

  const projectProgress = [
    { project: 'Green Valley Residency', progress: 75 },
    { project: 'City Mall Expansion', progress: 45 },
    { project: 'Smart Office Complex', progress: 60 },
    { project: 'Riverside Apartments', progress: 30 },
  ];

  const pendingApprovals = [
    { type: 'Material Requisitions', count: 8, icon: Package, path: '/purchase/mrs' },
    { type: 'Purchase Orders', count: 5, icon: ShoppingCart, path: '/purchase/pos' },
    { type: 'Work Orders', count: 3, icon: Briefcase, path: '/contracts/work-orders' },
    { type: 'RA Bills', count: 4, icon: FileText, path: '/contracts/ra-bills' },
  ];

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
          <p className="text-muted-foreground mt-1">Welcome back! Here's your construction ERP overview</p>
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
          value={formatCurrency(45000000, 'short')}
          description="Across all projects"
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Budget Utilized"
          value={formatCurrency(31500000, 'short')}
          description="70% of total budget"
          icon={TrendingDown}
        />
        <KPICard
          title="Pending Payments"
          value={formatCurrency(4200000, 'short')}
          description="Due this month"
          icon={Clock}
        />
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(6800000, 'short')}
          description="+12% from last month"
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* KPI Cards Row 2 - Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Projects"
          value="11"
          description="+2 this month"
          icon={Building2}
          trend={{ value: 18, isPositive: true }}
        />
        <KPICard
          title="Active Contractors"
          value="28"
          description="+3 this week"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Pending Approvals"
          value="20"
          description="Requires action"
          icon={AlertCircle}
        />
        <KPICard
          title="Stock Value"
          value="₹42.5L"
          description="Current inventory"
          icon={Package}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of all 11 projects</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses (Lakhs ₹)</CardTitle>
            <CardDescription>Materials, Labour & Equipment costs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="materials" fill="#3b82f6" name="Materials" />
                <Bar dataKey="labour" fill="#10b981" name="Labour" />
                <Bar dataKey="equipment" fill="#f59e0b" name="Equipment" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Top Project Progress</CardTitle>
            <CardDescription>Completion status of active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="project" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="progress" fill="#6366f1" name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-muted-foreground">Requires approval</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-xs text-muted-foreground">pending</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across all modules</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/notifications')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Purchase Order Approved</p>
                <p className="text-sm text-muted-foreground">PO-2024-001 for ABC Suppliers - ₹5.31L</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">New Material Requisition</p>
                <p className="text-sm text-muted-foreground">MR-2024-003 from Green Valley Residency</p>
                <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">RA Bill Pending</p>
                <p className="text-sm text-muted-foreground">RA-002 from Metro Builders awaiting approval - ₹2.85L</p>
                <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Project Milestone Completed</p>
                <p className="text-sm text-muted-foreground">Smart Office Complex - Foundation work completed</p>
                <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">SLA Breach Alert</p>
                <p className="text-sm text-muted-foreground">Journal Entry approval exceeded target time by 3 days</p>
                <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
