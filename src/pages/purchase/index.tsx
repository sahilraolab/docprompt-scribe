import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ShoppingCart,
  Clock,
  DollarSign,
  Download,
  FileCheck,
  Receipt,
  Send,
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import {
  useRequisitions,
  useQuotations,
  usePOs,
  usePurchaseBills,
} from '@/lib/hooks/usePurchase';
import { exportToCSV } from '@/lib/utils/export';
import { Badge } from '@/components/ui/badge';

export default function PurchaseIndex() {
  const navigate = useNavigate();

  /* ===================== DATA ===================== */

  const { data: mrs = [], isLoading: loadingMRs } = useRequisitions();
  const { data: quotations = [], isLoading: loadingQuotations } = useQuotations();
  const { data: pos = [], isLoading: loadingPOs } = usePOs();
  const { data: bills = [], isLoading: loadingBills } = usePurchaseBills();

  /* ===================== KPIs ===================== */

  const draftMRs = mrs.filter(m => m.status === 'DRAFT').length;
  const submittedMRs = mrs.filter(m => m.status === 'SUBMITTED').length;

  const createdPOs = pos.filter(p => p.status === 'CREATED').length;
  const approvedPOs = pos.filter(p => p.status === 'APPROVED').length;

  const totalApprovedPOValue = pos
    .filter(p => p.status === 'APPROVED')
    .reduce((sum, po) => sum + (po.totalAmount || 0), 0);

  const pendingBills = bills.filter(
    b => b.status === 'DRAFT' || b.status === 'APPROVED'
  ).length;

  /* ===================== EXPORT ===================== */

  const handleExport = () => {
    exportToCSV(
      [
        { Module: 'Material Requisitions', Total: mrs.length, Draft: draftMRs, Submitted: submittedMRs },
        { Module: 'Quotations', Total: quotations.length },
        { Module: 'Purchase Orders', Total: pos.length, Created: createdPOs, Approved: approvedPOs },
        { Module: 'Approved PO Value', Amount: totalApprovedPOValue },
        { Module: 'Purchase Bills', Pending: pendingBills },
      ],
      `purchase-overview-${new Date().toISOString().split('T')[0]}`
    );
  };

  /* ===================== RECENTS (SORTED) ===================== */

  const recentMRs = [...mrs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentPOs = [...pos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const isLoading =
    loadingMRs || loadingQuotations || loadingPOs || loadingBills;

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <p className="text-muted-foreground mt-1">
            End-to-end procurement workflow
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Pending MRs"
          value={submittedMRs.toString()}
          description="Awaiting approval"
          icon={Clock}
        />
        <KPICard
          title="Open POs"
          value={createdPOs.toString()}
          description="Pending approval"
          icon={ShoppingCart}
        />
        <KPICard
          title="Approved POs"
          value={approvedPOs.toString()}
          description="Confirmed orders"
          icon={FileCheck}
        />
        <KPICard
          title="Approved PO Value"
          value={formatCurrency(totalApprovedPOValue, 'short')}
          description="Total committed spend"
          icon={DollarSign}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent MRs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Material Requisitions</CardTitle>
            <CardDescription>Latest requests</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMRs.length ? (
              <div className="space-y-3">
                {recentMRs.map(mr => (
                  <div
                    key={mr.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => navigate(`/purchase/mrs/${mr.id}/view`)}
                  >
                    <div>
                      <p className="font-medium">{mr.reqNo}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {mr.status}
                      </p>
                    </div>
                    <Badge variant="outline">{mr.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No MRs found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent POs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
            <CardDescription>Latest approved & created POs</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPOs.length ? (
              <div className="space-y-3">
                {recentPOs.map(po => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => navigate(`/purchase/pos/${po.id}`)}
                  >
                    <div>
                      <p className="font-medium">{po.poNo}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(po.totalAmount || 0)}
                      </p>
                    </div>
                    <Badge variant="outline">{po.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No POs found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Material Requisitions', icon: FileText, path: '/purchase/mrs', badge: draftMRs },
          { title: 'Quotations', icon: FileCheck, path: '/purchase/quotations' },
          { title: 'Purchase Orders', icon: ShoppingCart, path: '/purchase/pos', badge: createdPOs },
          { title: 'Purchase Bills', icon: Receipt, path: '/purchase/bills', badge: pendingBills },
        ].map(m => (
          <Card
            key={m.path}
            className="cursor-pointer hover:shadow-md transition"
            onClick={() => navigate(m.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <m.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-base">{m.title}</CardTitle>
                  {m.badge ? (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {m.badge} Pending
                    </Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Purchase Workflow
          </CardTitle>
          <CardDescription>Standard procurement lifecycle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">1. MR</Badge>
            <span>→</span>
            <Badge variant="outline">2. RFQ</Badge>
            <span>→</span>
            <Badge variant="outline">3. Quotation</Badge>
            <span>→</span>
            <Badge variant="outline">4. PO</Badge>
            <span>→</span>
            <Badge variant="outline">5. Bill</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Purchase is locked by Approved Budget & Final Estimate (Engineering)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
