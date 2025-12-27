import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ShoppingCart, 
  Building, 
  Clock, 
  DollarSign, 
  Download,
  FileCheck,
  Receipt,
  Send
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { useMRs, usePOs, usePurchaseBills, useQuotations, useSuppliers } from '@/lib/hooks/usePurchase';
import { exportToCSV } from '@/lib/utils/export';
import { Badge } from '@/components/ui/badge';

export default function PurchaseIndex() {
  const navigate = useNavigate();
  
  // Data hooks
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers();
  const { data: mrs = [], isLoading: loadingMRs } = useMRs();
  const { data: quotations = [], isLoading: loadingQuotations } = useQuotations();
  const { data: pos = [], isLoading: loadingPOs } = usePOs();
  const { data: bills = [], isLoading: loadingBills } = usePurchaseBills();

  // KPI calculations
  const activeSuppliers = suppliers.filter((s: any) => s.status === 'Active' || s.active).length;
  const draftMRs = mrs.filter((m: any) => m.status === 'DRAFT').length;
  const submittedMRs = mrs.filter((m: any) => m.status === 'SUBMITTED').length;
  const createdPOs = pos.filter((p: any) => p.status === 'CREATED').length;
  const approvedPOs = pos.filter((p: any) => p.status === 'APPROVED').length;
  const totalPOValue = pos
    .filter((p: any) => p.status === 'APPROVED')
    .reduce((sum: number, po: any) => sum + (po.totalAmount || 0), 0);
  const pendingBills = bills.filter((b: any) => b.status === 'DRAFT' || b.status === 'APPROVED').length;

  const handleExport = () => {
    const data = [
      { Module: 'Suppliers', Total: suppliers.length, Active: activeSuppliers },
      { Module: 'MRs', Total: mrs.length, Draft: draftMRs, Submitted: submittedMRs },
      { Module: 'Quotations', Total: quotations.length },
      { Module: 'POs', Total: pos.length, Created: createdPOs, Approved: approvedPOs },
      { Module: 'Total PO Value (Approved)', Amount: totalPOValue },
    ];
    exportToCSV(data, `purchase-overview-${new Date().toISOString().split('T')[0]}`);
  };

  // Module cards matching API contract
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
      description: 'Create and submit material requests',
      icon: FileText,
      path: '/purchase/mrs',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: draftMRs > 0 ? `${draftMRs} Draft` : undefined,
    },
    {
      title: 'Quotations',
      description: 'Manage supplier quotations',
      icon: FileCheck,
      path: '/purchase/quotations',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Purchase Orders',
      description: 'Create and approve purchase orders',
      icon: ShoppingCart,
      path: '/purchase/pos',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: createdPOs > 0 ? `${createdPOs} Pending` : undefined,
    },
    {
      title: 'Purchase Bills',
      description: 'Manage bills and post to accounts',
      icon: Receipt,
      path: '/purchase/bills',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      badge: pendingBills > 0 ? `${pendingBills} Pending` : undefined,
    },
  ];

  const recentMRs = mrs.slice(0, 5);
  const recentPOs = pos.slice(0, 5);

  const isLoading = loadingSuppliers || loadingMRs || loadingPOs || loadingBills;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <p className="text-muted-foreground mt-1">Procurement workflow from MR to Payment</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Suppliers"
          value={loadingSuppliers ? '...' : activeSuppliers.toString()}
          description="Verified vendors"
          icon={Building}
        />
        <KPICard
          title="Pending MRs"
          value={loadingMRs ? '...' : submittedMRs.toString()}
          description="Awaiting approval"
          icon={Clock}
        />
        <KPICard
          title="Open POs"
          value={loadingPOs ? '...' : createdPOs.toString()}
          description="Pending approval"
          icon={ShoppingCart}
        />
        <KPICard
          title="Approved PO Value"
          value={loadingPOs ? '...' : formatCurrency(totalPOValue, 'short')}
          description="Total approved"
          icon={DollarSign}
        />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Material Requisitions</CardTitle>
            <CardDescription>Latest MR requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMRs.length > 0 ? (
              <div className="space-y-3">
                {recentMRs.map((mr: any) => (
                  <div 
                    key={mr.id || mr._id} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate(`/purchase/mrs/${mr.id || mr._id}`)}
                  >
                    <div>
                      <p className="font-medium">{mr.code || mr.reqNo}</p>
                      <p className="text-sm text-muted-foreground">{mr.projectName || 'N/A'}</p>
                    </div>
                    <Badge 
                      variant={mr.status === 'APPROVED' ? 'default' : mr.status === 'SUBMITTED' ? 'secondary' : 'outline'}
                    >
                      {mr.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No MRs found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
            <CardDescription>Latest POs</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPOs.length > 0 ? (
              <div className="space-y-3">
                {recentPOs.map((po: any) => (
                  <div 
                    key={po.id || po._id} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => navigate(`/purchase/pos/${po.id || po._id}`)}
                  >
                    <div>
                      <p className="font-medium">{po.poNo || po.code}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(po.totalAmount || 0)}</p>
                    </div>
                    <Badge 
                      variant={po.status === 'APPROVED' ? 'default' : po.status === 'CANCELLED' ? 'destructive' : 'outline'}
                    >
                      {po.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No POs found</p>
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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{module.title}</CardTitle>
                    {module.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {module.badge}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Workflow Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Purchase Workflow
          </CardTitle>
          <CardDescription>Standard procurement process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <span className="font-semibold">1.</span> MR (Draft → Submitted)
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="gap-1">
              <span className="font-semibold">2.</span> RFQ (Open → Closed)
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="gap-1">
              <span className="font-semibold">3.</span> Quotation (Submitted → Approved)
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="gap-1">
              <span className="font-semibold">4.</span> PO (Created → Approved)
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="outline" className="gap-1">
              <span className="font-semibold">5.</span> Bill (Draft → Posted)
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Purchase requires Approved Budget and Final Estimate from Engineering module
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
