import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Receipt, Briefcase, TrendingUp, DollarSign, Clock, Download } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { useContractors, useWorkOrders } from '@/lib/hooks/useContractors';
import { exportToCSV } from '@/lib/utils/export';

export default function ContractsIndex() {
  const navigate = useNavigate();
  const { data: contractors = [], isLoading: loadingContractors } = useContractors();
  const { data: workOrders = [], isLoading: loadingWOs } = useWorkOrders();

  const activeContractors = contractors.filter((c: any) => c.active === true).length;
  const activeWOs = workOrders.filter(wo => wo.status === 'Active').length;
  const totalWOValue = workOrders.reduce((sum, wo) => sum + (wo.amount || 0), 0);

  const handleExport = () => {
    const data = [
      { Module: 'Contractors', Total: contractors.length, Active: activeContractors },
      { Module: 'Work Orders', Total: workOrders.length, Active: activeWOs },
      { Module: 'Total Value', Amount: totalWOValue },
    ];
    exportToCSV(data, `contracts-overview-${new Date().toISOString().split('T')[0]}`);
  };

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

  const recentWOs = workOrders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts Management</h1>
          <p className="text-muted-foreground mt-1">Manage contractors, work orders and payments</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={loadingContractors}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Contractors"
          value={loadingContractors ? '...' : activeContractors.toString()}
          description="Registered vendors"
          icon={Briefcase}
        />
        <KPICard
          title="Active Work Orders"
          value={loadingWOs ? '...' : activeWOs.toString()}
          description="In progress"
          icon={FileText}
        />
        <KPICard
          title="Total Work Orders"
          value={loadingWOs ? '...' : workOrders.length.toString()}
          description="All contracts"
          icon={Clock}
        />
        <KPICard
          title="Total Contract Value"
          value={loadingWOs ? '...' : formatCurrency(totalWOValue, 'short')}
          description="Current contracts"
          icon={DollarSign}
        />
      </div>

      {/* Recent Work Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
          <CardDescription>Latest contractor assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {recentWOs.length > 0 ? (
            <div className="space-y-3">
              {recentWOs.map((wo: any) => (
                <div key={wo.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/contracts/work-orders/${wo.id}`)}>
                  <div className="flex-1">
                    <p className="font-medium">{wo.code || wo.id}</p>
                    <p className="text-sm text-muted-foreground">{wo.contractorName} • {wo.projectName}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-medium">{formatCurrency(wo.amount || 0, 'short')}</p>
                    <p className="text-xs text-muted-foreground">{wo.progress || 0}% complete</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${wo.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {wo.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No work orders found</p>
          )}
        </CardContent>
      </Card>

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
