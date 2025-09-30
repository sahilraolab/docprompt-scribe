import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, ShoppingCart, FileSpreadsheet, Building } from 'lucide-react';

export default function PurchaseIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Material Requisitions',
      description: 'Create and manage material requests',
      icon: FileText,
      path: '/purchase/mrs',
      color: 'text-blue-600',
    },
    {
      title: 'Quotations',
      description: 'Manage supplier quotations',
      icon: FileSpreadsheet,
      path: '/purchase/quotations',
      color: 'text-green-600',
    },
    {
      title: 'Purchase Orders',
      description: 'Create and track purchase orders',
      icon: ShoppingCart,
      path: '/purchase/pos',
      color: 'text-purple-600',
    },
    {
      title: 'Suppliers',
      description: 'Manage supplier database',
      icon: Building,
      path: '/purchase/suppliers',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase Management</h1>
        <p className="text-muted-foreground">Procurement and supplier management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
