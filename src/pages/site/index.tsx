import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Warehouse, PackageCheck, Send, ArrowRightLeft, ClipboardCheck } from 'lucide-react';

export default function SiteIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Items Master',
      description: 'Manage material items catalog',
      icon: Package,
      path: '/site/items',
      color: 'text-blue-600',
    },
    {
      title: 'Stock',
      description: 'Track inventory and stock levels',
      icon: Warehouse,
      path: '/site/stock',
      color: 'text-green-600',
    },
    {
      title: 'GRN',
      description: 'Goods receipt from suppliers',
      icon: PackageCheck,
      path: '/site/grn',
      color: 'text-purple-600',
    },
    {
      title: 'Issues',
      description: 'Material issued to sites',
      icon: Send,
      path: '/site/issues',
      color: 'text-amber-600',
    },
    {
      title: 'Transfers',
      description: 'Stock transfers between sites',
      icon: ArrowRightLeft,
      path: '/site/transfers',
      color: 'text-cyan-600',
    },
    {
      title: 'Quality Control',
      description: 'Material QC inspections',
      icon: ClipboardCheck,
      path: '/site/qc',
      color: 'text-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site & Store Management</h1>
        <p className="text-muted-foreground">Inventory and material management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <module.icon className={`h-8 w-8 ${module.color}`} />
                <CardTitle className="text-lg">{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
