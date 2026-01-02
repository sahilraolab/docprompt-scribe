import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequisitions } from '@/lib/hooks/usePurchase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { exportToCSV } from '@/lib/utils/export';
import {
  Plus,
  Search,
  FileText,
  Loader2,
  Download,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function MRList() {
  const navigate = useNavigate();
  const { data: mrs = [], isLoading } = useRequisitions();
  const [searchQuery, setSearchQuery] = useState('');

  /* ===================== NORMALIZE ===================== */
  const normalizedMRs = useMemo(
    () =>
      mrs.map((mr: any) => ({
        id: mr.id,
        reqNo: mr.reqNo,
        projectName: mr.projectName || '—',
        requestedByName: mr.requestedByName || '—',
        itemsCount: mr.items?.length || 0,
        status: mr.status,
        createdAt: mr.createdAt,
      })),
    [mrs]
  );

  /* ===================== FILTER ===================== */
  const filteredMRs = useMemo(() => {
    if (!searchQuery) return normalizedMRs;

    const q = searchQuery.toLowerCase();
    return normalizedMRs.filter(
      (mr) =>
        mr.reqNo?.toLowerCase().includes(q) ||
        mr.projectName.toLowerCase().includes(q) ||
        mr.requestedByName.toLowerCase().includes(q)
    );
  }, [normalizedMRs, searchQuery]);

  /* ===================== EXPORT ===================== */
  const handleExport = () => {
    if (!filteredMRs.length) return;

    exportToCSV(
      filteredMRs.map((mr) => ({
        'MR No': mr.reqNo,
        Project: mr.projectName,
        'Requested By': mr.requestedByName,
        Items: mr.itemsCount,
        Status: mr.status,
        Date: formatDate(mr.createdAt),
      })),
      `material-requisitions-${new Date().toISOString().split('T')[0]}`
    );

  };

  /* ===================== LOADING ===================== */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ===================== UI ===================== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Requisitions</h1>
          <p className="text-muted-foreground">
            Project-wise material requests
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!filteredMRs.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/purchase/mrs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New MR
          </Button>
        </div>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by MR No, Project, or Requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredMRs.length ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MR No</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredMRs.map((mr) => (
                    <TableRow
                      key={mr.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        navigate(`/purchase/mrs/${mr.id}/view`)
                      }
                    >
                      <TableCell className="font-medium">
                        {mr.reqNo}
                      </TableCell>
                      <TableCell>{mr.projectName}</TableCell>
                      <TableCell>{mr.itemsCount}</TableCell>
                      <TableCell>{mr.requestedByName}</TableCell>
                      <TableCell>
                        {formatDate(mr.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={mr.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No Material Requisitions"
              description={
                searchQuery
                  ? 'No MRs match your search'
                  : 'Create your first material requisition'
              }
              action={
                !searchQuery
                  ? {
                    label: 'Create MR',
                    onClick: () =>
                      navigate('/purchase/mrs/new'),
                  }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
