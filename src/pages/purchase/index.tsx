import { useState } from 'react';
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
  Building2,
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import {
  useRequisitions,
  usePOs,
  usePurchaseBills,
  useRFQs,
} from '@/lib/hooks/usePurchase';
import { useProjects } from '@/lib/hooks/useProjects';
import { exportToCSV } from '@/lib/utils/export';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PurchaseIndex() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  /* ===================== PROJECTS ===================== */

  const { data: projects = [], isLoading: loadingProjects } = useProjects();

  const projectOptions = projects.map((p: any) => ({
    value: String(p.id),
    label: p.name || p.code || `Project ${p.id}`,
  }));

  /* ===================== DATA ===================== */

  const { data: mrs = [], isLoading: loadingMRs } = useRequisitions(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const { data: rfqs = [], isLoading: loadingRFQs } = useRFQs(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const { data: pos = [], isLoading: loadingPOs } = usePOs(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const { data: bills = [], isLoading: loadingBills } = usePurchaseBills(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  /* ===================== KPIs ===================== */

  const draftMRs = mrs.filter((m: any) => m.status === 'DRAFT').length;
  const submittedMRs = mrs.filter((m: any) => m.status === 'SUBMITTED').length;

  const openRFQs = rfqs.filter((r: any) => r.status === 'OPEN').length;

  const createdPOs = pos.filter((p: any) => p.status === 'CREATED').length;
  const approvedPOs = pos.filter((p: any) => p.status === 'APPROVED').length;

  const totalApprovedPOValue = pos
    .filter((p: any) => p.status === 'APPROVED')
    .reduce((sum: number, po: any) => sum + (po.totalAmount || 0), 0);

  const pendingBills = bills.filter(
    (b: any) => b.status === 'DRAFT' || b.status === 'APPROVED'
  ).length;

  /* ===================== EXPORT ===================== */

  const handleExport = () => {
    exportToCSV(
      [
        {
          Module: 'Material Requisitions',
          Total: mrs.length,
          Draft: draftMRs,
          Submitted: submittedMRs,
        },
        {
          Module: 'RFQs',
          Open: openRFQs,
          Total: rfqs.length,
        },
        {
          Module: 'Purchase Orders',
          Total: pos.length,
          Created: createdPOs,
          Approved: approvedPOs,
        },
        {
          Module: 'Approved PO Value',
          Amount: totalApprovedPOValue,
        },
        {
          Module: 'Purchase Bills',
          Pending: pendingBills,
        },
      ],
      `purchase-overview-${new Date().toISOString().split('T')[0]}`
    );
  };

  /* ===================== RECENTS ===================== */

  const recentMRs = [...mrs]
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentRFQs = [...rfqs]
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentPOs = [...pos]
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const isLoading =
    loadingProjects ||
    (selectedProjectId &&
      (loadingMRs || loadingRFQs || loadingPOs || loadingBills));

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchase Management</h1>
          <p className="text-muted-foreground mt-1">
            End-to-end procurement workflow
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64">
            <SearchableSelect
              options={projectOptions}
              value={selectedProjectId ? String(selectedProjectId) : undefined}
              onChange={(val) => setSelectedProjectId(Number(val))}
              placeholder="Select Project..."
              searchPlaceholder="Search projects..."
              emptyMessage="No projects found."
              disabled={loadingProjects}
            />
          </div>

          <Button
            onClick={handleExport}
            variant="outline"
            disabled={!selectedProjectId || !!isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Project Selection Alert */}
      {!selectedProjectId && (
        <Alert>
          <Building2 className="h-4 w-4" />
          <AlertDescription>
            Please select a project to view purchase data. All purchase
            operations are project-specific.
          </AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      {selectedProjectId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Pending MRs"
            value={submittedMRs.toString()}
            description="Awaiting approval"
            icon={Clock}
          />
          <KPICard
            title="Open RFQs"
            value={openRFQs.toString()}
            description="Awaiting quotations"
            icon={Send}
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
      )}

      {/* Recent Activity */}
      {selectedProjectId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent MRs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent MRs</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMRs.length ? (
                recentMRs.map((mr: any) => (
                  <div
                    key={mr.id}
                    className="flex justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent mb-2"
                    onClick={() =>
                      navigate(`/purchase/mrs/${mr.id}/view`)
                    }
                  >
                    <span>{mr.reqNo}</span>
                    <Badge variant="outline">{mr.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No MRs found
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent RFQs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent RFQs</CardTitle>
            </CardHeader>
            <CardContent>
              {recentRFQs.length ? (
                recentRFQs.map((rfq: any) => (
                  <div
                    key={rfq.id}
                    className="flex justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent mb-2"
                    onClick={() =>
                      navigate(`/purchase/rfqs/${rfq.id}`)
                    }
                  >
                    <span>{rfq.rfqNo}</span>
                    <Badge variant="outline">{rfq.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No RFQs found
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent POs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent POs</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPOs.length ? (
                recentPOs.map((po: any) => (
                  <div
                    key={po.id}
                    className="flex justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent mb-2"
                    onClick={() => navigate(`/purchase/pos/${po.id}`)}
                  >
                    <span>{po.poNo}</span>
                    <Badge variant="outline">{po.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No POs found
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Module Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          {
            title: 'Material Requisitions',
            icon: FileText,
            path: '/purchase/mrs',
            badge: draftMRs,
          },
          {
            title: 'RFQs',
            icon: Send,
            path: '/purchase/rfqs',
            badge: openRFQs,
          },
          {
            title: 'Quotations',
            icon: FileCheck,
            path: '/purchase/quotations',
          },
          {
            title: 'Purchase Orders',
            icon: ShoppingCart,
            path: '/purchase/pos',
            badge: createdPOs,
          },
          {
            title: 'Purchase Bills',
            icon: Receipt,
            path: '/purchase/bills',
            badge: pendingBills,
          },
        ].map((m) => (
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
            ⚠️ Purchase is locked by Approved Budget & Final Estimate
            (Engineering)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
