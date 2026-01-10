/**
 * Inventory Module Dashboard
 * Aligned with backend inventory module
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Warehouse, 
  PackageCheck, 
  Send, 
  ArrowRightLeft, 
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { useGRNs, useIssues, useTransfers, useStock } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { SearchableSelect } from '@/components/SearchableSelect';
import { exportToCSV } from '@/lib/utils/export';
import { formatCurrency } from '@/lib/utils/format';

export default function InventoryIndex() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const { data: projects = [] } = useProjects();
  
  // Fetch data only when project is selected
  const { data: grns = [], isLoading: loadingGRNs } = useGRNs(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  const { data: issues = [], isLoading: loadingIssues } = useIssues(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  const { data: transfers = [], isLoading: loadingTransfers } = useTransfers(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  const { data: stock = [], isLoading: loadingStock } = useStock(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  // KPI calculations
  const pendingGRNs = grns.filter((g: any) => g.status === 'QC_PENDING' || g.status === 'DRAFT').length;
  const approvedGRNs = grns.filter((g: any) => g.status === 'APPROVED' || g.status === 'PARTIAL_APPROVED').length;
  const activeIssues = issues.filter((i: any) => i.status === 'APPROVED').length;
  const pendingTransfers = transfers.filter((t: any) => t.status === 'DRAFT' || t.status === 'APPROVED').length;
  const stockValue = stock.reduce((sum: number, s: any) => sum + (s.value || 0), 0);
  const lowStockCount = stock.filter((s: any) => (s.quantity || 0) < 10).length;

  const handleExport = () => {
    const data = [
      { Metric: 'Pending GRNs', Value: pendingGRNs },
      { Metric: 'Approved GRNs', Value: approvedGRNs },
      { Metric: 'Active Issues', Value: activeIssues },
      { Metric: 'Pending Transfers', Value: pendingTransfers },
      { Metric: 'Total Stock Value', Value: stockValue },
      { Metric: 'Low Stock Items', Value: lowStockCount },
    ];
    exportToCSV(data, `inventory-overview-${new Date().toISOString().split('T')[0]}`);
  };

  const modules = [
    {
      title: 'GRN (Goods Receipt)',
      description: 'Receive materials from approved POs',
      icon: PackageCheck,
      path: '/inventory/grn',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      count: grns.length,
    },
    {
      title: 'Material Issues',
      description: 'Issue materials for site consumption',
      icon: Send,
      path: '/inventory/issues',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      count: issues.length,
    },
    {
      title: 'Stock Transfers',
      description: 'Transfer stock between locations',
      icon: ArrowRightLeft,
      path: '/inventory/transfers',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      count: transfers.length,
    },
    {
      title: 'Stock Register',
      description: 'View current stock levels',
      icon: Warehouse,
      path: '/inventory/stock',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      count: stock.length,
    },
    {
      title: 'Stock Ledger',
      description: 'Audit trail of all movements',
      icon: FileText,
      path: '/inventory/ledger',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  const isLoading = loadingGRNs || loadingIssues || loadingTransfers || loadingStock;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Material receipt, storage, movement & consumption
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={!selectedProjectId}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* Project Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Project</CardTitle>
          <CardDescription>Choose a project to view inventory data</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchableSelect
            options={projects.map((p: any) => ({
              value: p.id || p._id,
              label: `${p.name} (${p.code || 'N/A'})`,
            }))}
            value={selectedProjectId?.toString() || ''}
            onChange={(val) => setSelectedProjectId(val ? Number(val) : null)}
            placeholder="Search and select a project..."
          />
        </CardContent>
      </Card>

      {!selectedProjectId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Project</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Choose a project above to view inventory data, GRNs, material issues, and stock levels.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Pending GRNs"
              value={isLoading ? '...' : pendingGRNs.toString()}
              description="Awaiting QC/Approval"
              icon={PackageCheck}
            />
            <KPICard
              title="Active Issues"
              value={isLoading ? '...' : activeIssues.toString()}
              description="Materials issued"
              icon={Send}
            />
            <KPICard
              title="Stock Value"
              value={isLoading ? '...' : formatCurrency(stockValue, 'short')}
              description="Current inventory"
              icon={Warehouse}
            />
            <KPICard
              title="Low Stock Items"
              value={isLoading ? '...' : lowStockCount.toString()}
              description="Below minimum level"
              icon={AlertTriangle}
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
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{module.title}</CardTitle>
                        {module.count !== undefined && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {module.count}
                          </span>
                        )}
                      </div>
                      <CardDescription className="text-sm mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-purple-500" />
                  Recent GRNs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {grns.length > 0 ? (
                  <div className="space-y-3">
                    {grns.slice(0, 5).map((grn: any) => (
                      <div
                        key={grn.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => navigate(`/inventory/grn/${grn.id}`)}
                      >
                        <div>
                          <p className="font-medium">{grn.grnNo}</p>
                          <p className="text-sm text-muted-foreground">
                            PO: {grn.poNo || grn.poId}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          grn.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          grn.status === 'QC_PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {grn.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No GRNs found for this project
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-amber-500" />
                  Recent Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {issues.length > 0 ? (
                  <div className="space-y-3">
                    {issues.slice(0, 5).map((issue: any) => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => navigate(`/inventory/issues/${issue.id}`)}
                      >
                        <div>
                          <p className="font-medium">{issue.issueNo}</p>
                          <p className="text-sm text-muted-foreground">
                            {issue.purpose}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          issue.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          issue.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No issues found for this project
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
