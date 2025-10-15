import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/KPICard';
import { 
  TrendingUp, 
  Package, 
  Users, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle
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
  // Mock data for charts
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
    { project: 'Green Valley', progress: 75 },
    { project: 'City Mall', progress: 45 },
    { project: 'Smart Office', progress: 60 },
    { project: 'Riverside', progress: 30 },
  ];

  const pendingApprovals = [
    { type: 'Material Requisitions', count: 8, icon: Package },
    { type: 'Purchase Orders', count: 5, icon: FileText },
    { type: 'Work Orders', count: 3, icon: Users },
    { type: 'RA Bills', count: 4, icon: FileText },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your construction ERP</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Projects"
          value="11"
          description="+2 this month"
          icon={TrendingUp}
          trend={{ value: 18, isPositive: true }}
        />
        <KPICard
          title="Total Budget"
          value={formatCurrency(45000000, 'short')}
          description="+8% from last month"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <KPICard
          title="Pending Approvals"
          value="20"
          description="5 urgent"
          icon={Clock}
        />
        <KPICard
          title="Active Contractors"
          value="28"
          description="+3 this week"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Current status of all projects</CardDescription>
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
            <CardTitle>Monthly Expenses (Lakhs)</CardTitle>
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
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Top 4 active projects completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="project" type="category" width={100} />
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
            <div className="space-y-4">
              {pendingApprovals.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
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
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across all modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border-l-4 border-green-500 bg-green-50 rounded">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Purchase Order Approved</p>
                <p className="text-sm text-muted-foreground">PO-2024-001 for ABC Suppliers - ₹5.31L</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">New Material Requisition</p>
                <p className="text-sm text-muted-foreground">MR-2024-003 from Green Valley project</p>
                <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border-l-4 border-amber-500 bg-amber-50 rounded">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">RA Bill Pending</p>
                <p className="text-sm text-muted-foreground">RA-002 from Metro Builders awaiting approval</p>
                <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border-l-4 border-red-500 bg-red-50 rounded">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">SLA Breach Alert</p>
                <p className="text-sm text-muted-foreground">Journal Entry approval exceeded target time</p>
                <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
