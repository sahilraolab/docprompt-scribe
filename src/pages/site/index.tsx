import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Warehouse, PackageCheck, Send, ArrowRightLeft, ClipboardCheck, TrendingDown, AlertTriangle } from 'lucide-react';
import { KPICard } from '@/components/KPICard';

export default function SiteIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Items Master',
      description: 'Manage material items catalog',
      icon: Package,
      path: '/site/items',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Stock',
      description: 'Track inventory and stock levels',
      icon: Warehouse,
      path: '/site/stock',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'GRN',
      description: 'Goods receipt from suppliers',
      icon: PackageCheck,
      path: '/site/grn',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Issues',
      description: 'Material issued to sites',
      icon: Send,
      path: '/site/issues',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Transfers',
      description: 'Stock transfers between sites',
      icon: ArrowRightLeft,
      path: '/site/transfers',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
    {
      title: 'Quality Control',
      description: 'Material QC inspections',
      icon: ClipboardCheck,
      path: '/site/qc',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site & Store Management</h1>
        <p className="text-muted-foreground mt-1">Inventory and material management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Items"
          value="342"
          description="In catalog"
          icon={Package}
        />
        <KPICard
          title="Stock Value"
          value="₹42.5L"
          description="Current inventory"
          icon={Warehouse}
        />
        <KPICard
          title="Low Stock Items"
          value="15"
          description="Below reorder level"
          icon={AlertTriangle}
        />
        <KPICard
          title="Pending GRNs"
          value="8"
          description="Awaiting receipt"
          icon={TrendingDown}
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
