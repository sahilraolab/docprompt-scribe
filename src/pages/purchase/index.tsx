import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, ShoppingCart, FileSpreadsheet, Building, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';

export default function PurchaseIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Suppliers',
      description: 'Manage supplier database',
      icon: Building,
      path: '/purchase/suppliers',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Material Requisitions',
      description: 'Create and manage material requests',
      icon: FileText,
      path: '/purchase/mrs',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Quotations',
      description: 'Manage supplier quotations',
      icon: FileSpreadsheet,
      path: '/purchase/quotations',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Comparative Statements',
      description: 'Compare and analyze quotations',
      icon: FileSpreadsheet,
      path: '/purchase/comparative',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Purchase Orders',
      description: 'Create and track purchase orders',
      icon: ShoppingCart,
      path: '/purchase/pos',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Purchase Bills',
      description: 'Manage supplier invoices',
      icon: FileText,
      path: '/purchase/bills',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      title: 'Rate Management',
      description: 'Track and manage material rates',
      icon: TrendingUp,
      path: '/purchase/rates',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Management</h1>
        <p className="text-muted-foreground mt-1">Procurement and supplier management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Suppliers"
          value="48"
          description="Verified vendors"
          icon={Building}
        />
        <KPICard
          title="Pending MRs"
          value="12"
          description="Awaiting approval"
          icon={Clock}
        />
        <KPICard
          title="Open POs"
          value="23"
          description="Not yet delivered"
          icon={ShoppingCart}
        />
        <KPICard
          title="Total PO Value"
          value={formatCurrency(8750000, 'short')}
          description="This month"
          icon={DollarSign}
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
