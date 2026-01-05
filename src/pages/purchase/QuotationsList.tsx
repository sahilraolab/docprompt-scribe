import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjects } from '@/lib/hooks/useProjects';
import {
  useRequisitions,
  useRFQs,
  useQuotations,
  useApproveQuotation,
  useCreatePO,
} from '@/lib/hooks/usePurchase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SearchableSelect } from '@/components/SearchableSelect';

import { formatDate, formatCurrency } from '@/lib/utils/format';

import {
  Loader2,
  Search,
  FileText,
  Eye,
  CheckCircle,
  ShoppingCart,
  Building2,
  Lock,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { MoreHorizontal } from 'lucide-react';

/* =====================================================
   COMPONENT
===================================================== */

export default function QuotationsList() {
  const navigate = useNavigate();

  /* =====================================================
     PROJECT (MANDATORY)
  ===================================================== */

  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const [projectId, setProjectId] = useState<number | null>(null);

  const projectOptions = projects.map((p: any) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
  }));

  /* =====================================================
     MATERIAL REQUISITIONS
  ===================================================== */

  const { data: mrs = [], isLoading: loadingMRs } = useRequisitions(
    projectId ? { projectId } : undefined,
    { enabled: !!projectId }
  );

  const [requisitionId, setRequisitionId] = useState<number | null>(null);

  const mrOptions = mrs.map((mr: any) => ({
    value: String(mr.id),
    label: `${mr.reqNo} (${mr.status})`,
  }));

  /* =====================================================
     RFQs
  ===================================================== */

  const { data: rfqs = [], isLoading: loadingRFQs } = useRFQs(
    requisitionId ? { requisitionId } : undefined,
    { enabled: !!requisitionId }
  );

  const [rfqId, setRfqId] = useState<number | null>(null);

  const rfqOptions = rfqs.map((rfq: any) => ({
    value: String(rfq.id),
    label: `${rfq.rfqNo} (${rfq.status})`,
  }));

  /* =====================================================
     QUOTATIONS (RFQ-SCOPED)
  ===================================================== */

  const {
    data: quotations = [],
    isLoading: loadingQuotations,
  } = useQuotations(
    rfqId ? { rfqId } : undefined,
    { enabled: !!rfqId }
  );

  const approveQuotation = useApproveQuotation();
  const createPO = useCreatePO();

  /* =====================================================
     UI STATE
  ===================================================== */

  const [search, setSearch] = useState('');
  const [approveId, setApproveId] = useState<number | null>(null);
  const [createPOId, setCreatePOId] = useState<number | null>(null);

  /* =====================================================
     FILTER
  ===================================================== */

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return quotations.filter((qt: any) =>
      String(qt.supplierId).includes(q) ||
      String(qt.id).includes(q)
    );
  }, [quotations, search]);

  /* =====================================================
     LOADING STATES
  ===================================================== */

  const initialLoading = loadingProjects;
  const tableLoading =
    !!projectId &&
    !!requisitionId &&
    !!rfqId &&
    loadingQuotations;

  if (initialLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quotations</h1>
        <p className="text-muted-foreground">
          Supplier quotations received against RFQs
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchableSelect
            options={projectOptions}
            value={projectId ? String(projectId) : undefined}
            onChange={(val) => {
              setProjectId(Number(val));
              setRequisitionId(null);
              setRfqId(null);
            }}
            placeholder="Select Project..."
          />

          <SearchableSelect
            options={mrOptions}
            value={requisitionId ? String(requisitionId) : undefined}
            onChange={(val) => {
              setRequisitionId(Number(val));
              setRfqId(null);
            }}
            disabled={!projectId || loadingMRs}
            placeholder="Select Material Requisition..."
          />

          <SearchableSelect
            options={rfqOptions}
            value={rfqId ? String(rfqId) : undefined}
            onChange={(val) => setRfqId(Number(val))}
            disabled={!requisitionId || loadingRFQs}
            placeholder="Select RFQ..."
          />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search quotations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!rfqId}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Empty States */}
      {!projectId && (
        <EmptyState
          icon={Building2}
          title="Select a Project"
          description="Quotations are project-specific"
        />
      )}

      {projectId && requisitionId && rfqId && (
        <Card>
          <CardContent>
            {tableLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filtered.map((q: any) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {q.id}
                            {(q.status === 'APPROVED' ||
                              q.status === 'REJECTED') && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>

                        <TableCell>{q.supplierId}</TableCell>
                        <TableCell>{formatDate(q.createdAt)}</TableCell>
                        <TableCell>
                          {formatCurrency(q.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={q.status} />
                        </TableCell>

                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/purchase/quotations/${q.id}`
                                  )
                                }
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>

                              {q.status === 'SUBMITTED' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setApproveId(q.id)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                </>
                              )}

                              {q.status === 'APPROVED' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setCreatePOId(q.id)
                                    }
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-2 text-primary" />
                                    Create PO
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={FileText}
                title="No quotations found"
                description="Suppliers have not submitted quotations yet"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Approve */}
      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Approve Quotation"
        description="Approving will close the RFQ and lock this quotation."
        confirmText="Approve"
        onConfirm={() =>
          approveId &&
          approveQuotation.mutate(approveId, {
            onSuccess: () => setApproveId(null),
          })
        }
      />

      {/* Create PO */}
      <ConfirmDialog
        open={!!createPOId}
        onOpenChange={() => setCreatePOId(null)}
        title="Create Purchase Order"
        description="Create PO from this approved quotation?"
        confirmText="Create PO"
        onConfirm={() =>
          createPOId &&
          createPO.mutate(createPOId, {
            onSuccess: () => {
              setCreatePOId(null);
              navigate('/purchase/pos');
            },
          })
        }
      />
    </div>
  );
}
