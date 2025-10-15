import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Receipt, Briefcase, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';

export default function ContractsIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Contractors',
      description: 'Contractor database and details',
      icon: Briefcase,
      path: '/contracts/contractors',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Work Orders',
      description: 'Manage contractor work orders',
      icon: FileText,
      path: '/contracts/work-orders',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'RA Bills',
      description: 'Running account bills and payments',
      icon: Receipt,
      path: '/contracts/ra-bills',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Labour Rates',
      description: 'Labour category rates and wages',
      icon: Users,
      path: '/contracts/labour-rates',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contracts Management</h1>
        <p className="text-muted-foreground mt-1">Manage contractors, work orders and payments</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Contractors"
          value="28"
          description="+3 this month"
          icon={Briefcase}
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Active Work Orders"
          value="15"
          description="In progress"
          icon={FileText}
        />
        <KPICard
          title="Pending RA Bills"
          value="8"
          description="Awaiting approval"
          icon={Clock}
        />
        <KPICard
          title="Total Contract Value"
          value={formatCurrency(12500000, 'short')}
          description="Current contracts"
          icon={DollarSign}
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all border-t-4 hover:border-t-primary"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-4 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-8 w-8 ${module.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
