import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProjects } from '@/lib/hooks/useProjects';
import { useRequisitions, useRFQs } from '@/lib/hooks/usePurchase';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SearchableSelect } from '@/components/SearchableSelect';

import { formatDate } from '@/lib/utils/format';

import {
  Plus,
  Search,
  Loader2,
  Send,
  Building2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/* =====================================================
   COMPONENT
===================================================== */

export default function RFQList() {
  const navigate = useNavigate();

  /* ================= PROJECT ================= */

  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const [projectId, setProjectId] = useState<number | null>(null);

  const projectOptions = useMemo(
    () =>
      projects.map((p: any) => ({
        value: String(p.id),
        label: `${p.name} (${p.code})`,
      })),
    [projects]
  );

  /* ================= MRs ================= */

  const { data: mrs = [], isLoading: loadingMRs } = useRequisitions(
    projectId ? { projectId } : undefined,
    { enabled: !!projectId }
  );

  const [requisitionId, setRequisitionId] = useState<number | null>(null);

  const mrOptions = useMemo(
    () =>
      mrs.map((mr: any) => ({
        value: String(mr.id),
        label: `${mr.reqNo} (${mr.status})`,
      })),
    [mrs]
  );

  /* ================= RFQs ================= */

  const { data: rfqs = [], isLoading: loadingRFQs } = useRFQs(
    requisitionId ? { requisitionId } : undefined,
    { enabled: !!requisitionId }
  );

  /* ================= UI ================= */

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'all' | 'OPEN' | 'CLOSED'>('all');

  const filteredRFQs = useMemo(() => {
    const q = search.toLowerCase();

    return rfqs.filter((r: any) => {
      const matchesSearch =
        r.rfqNo?.toLowerCase().includes(q) ||
        String(r.supplierId).includes(q);

      const matchesStatus =
        statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rfqs, search, statusFilter]);

  const loading =
    loadingProjects || (projectId && (loadingMRs || loadingRFQs));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">RFQs</h1>
          <p className="text-muted-foreground">
            Request for Quotations (auto-closed on quotation approval)
          </p>
        </div>

        <Button onClick={() => navigate('/purchase/rfqs/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New RFQ
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchableSelect
            options={projectOptions}
            value={projectId ? String(projectId) : undefined}
            onChange={(v) => {
              setProjectId(Number(v));
              setRequisitionId(null);
            }}
            placeholder="Select Project"
          />

          <SearchableSelect
            options={mrOptions}
            value={requisitionId ? String(requisitionId) : undefined}
            onChange={(v) => setRequisitionId(Number(v))}
            disabled={!projectId}
            placeholder="Select MR"
          />

          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as 'all' | 'OPEN' | 'CLOSED')
            }
            disabled={!requisitionId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search RFQ No / Supplier"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!requisitionId}
            />
          </div>
        </CardContent>
      </Card>

      {!projectId && (
        <EmptyState
          icon={Building2}
          title="Select a project"
          description="RFQs are project-scoped"
        />
      )}

      {projectId && requisitionId && (
        <Card>
          <CardContent>
            {filteredRFQs.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ No</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>RFQ Date</TableHead>
                    <TableHead>Closing Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRFQs.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.rfqNo}</TableCell>
                      <TableCell>{r.supplierId}</TableCell>
                      <TableCell>{formatDate(r.rfqDate)}</TableCell>
                      <TableCell>
                        {r.closingDate
                          ? formatDate(r.closingDate)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={Send}
                title="No RFQs"
                description="Create RFQs for this MR"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
