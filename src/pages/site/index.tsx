import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Warehouse, PackageCheck, Send, ArrowRightLeft, ClipboardCheck, TrendingDown, AlertTriangle, Download } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { useItems, useStock } from '@/lib/hooks/useSite';
import { exportToCSV } from '@/lib/utils/export';
import { formatCurrency } from '@/lib/utils/format';

export default function SiteIndex() {
  const navigate = useNavigate();
  const { data: items = [], isLoading: loadingItems } = useItems();
  const { data: stock = [], isLoading: loadingStock } = useStock();
  const { data: grns = [], isLoading: loadingGRNs } = useItems();

  const totalItems = items.length;
  const stockValue = stock.reduce((sum: number, s: any) => sum + ((s.quantity || 0) * (s.rate || 0)), 0);
  const lowStockItems = stock.filter((s: any) => s.quantity < (s.reorderLevel || 10)).length;
  const pendingGRNs = grns.filter((g: any) => g.status === 'pending').length;

  const handleExport = () => {
    const data = [
      { Module: 'Items', Total: totalItems },
      { Module: 'Stock Value', Amount: stockValue },
      { Module: 'Low Stock Items', Count: lowStockItems },
      { Module: 'Pending GRNs', Count: pendingGRNs },
    ];
    exportToCSV(data, `site-overview-${new Date().toISOString().split('T')[0]}`);
  };

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

  const lowStockList = stock.filter((s: any) => s.quantity < (s.reorderLevel || 10)).slice(0, 5);
  const recentItems = items.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site & Store Management</h1>
          <p className="text-muted-foreground mt-1">Inventory and material management</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={loadingItems}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Items"
          value={loadingItems ? '...' : totalItems.toString()}
          description="In catalog"
          icon={Package}
        />
        <KPICard
          title="Stock Value"
          value={loadingStock ? '...' : formatCurrency(stockValue, 'short')}
          description="Current inventory"
          icon={Warehouse}
        />
        <KPICard
          title="Low Stock Items"
          value={loadingStock ? '...' : lowStockItems.toString()}
          description="Below reorder level"
          icon={AlertTriangle}
        />
        <KPICard
          title="Pending GRNs"
          value={loadingGRNs ? '...' : pendingGRNs.toString()}
          description="Awaiting receipt"
          icon={TrendingDown}
        />
      </div>

      {/* Alerts and Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Items below reorder level</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockList.length > 0 ? (
              <div className="space-y-3">
                {lowStockList.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-amber-700">{item.quantity} {item.uom}</p>
                      <p className="text-xs text-muted-foreground">Min: {item.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">All stock levels are healthy</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Items</CardTitle>
            <CardDescription>Recently added materials</CardDescription>
          </CardHeader>
          <CardContent>
            {recentItems.length > 0 ? (
              <div className="space-y-3">
                {recentItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/site/items/${item.id}`)}>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.code} • {item.category}</p>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(item.rate || 0)}/{item.uom}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No items found</p>
            )}
          </CardContent>
        </Card>
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
