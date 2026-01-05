import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequisitions } from '@/lib/hooks/usePurchase';
import { useProjects } from '@/lib/hooks/useProjects';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SearchableSelect } from '@/components/SearchableSelect';

import { formatDate } from '@/lib/utils/format';
import { exportToCSV } from '@/lib/utils/export';

import {
  Plus,
  Search,
  FileText,
  Loader2,
  Download,
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

export default function MRList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);

  /* ===================== PROJECTS ===================== */
  const { data: projects = [], isLoading: loadingProjects } = useProjects();

  const projectOptions = projects.map((p: any) => ({
    value: String(p.id),
    label: p.name || p.code,
  }));

  /* ===================== DATA ===================== */
  const { data: mrs = [], isLoading } = useRequisitions(
    projectId ? { projectId } : undefined,
    { enabled: !!projectId }
  );

  /* ===================== NORMALIZE ===================== */
  const normalizedMRs = useMemo(
    () =>
      mrs.map((mr: any) => ({
        id: mr.id,
        reqNo: mr.reqNo,
        requestedBy: mr.requestedByName || '—',
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
        mr.reqNo.toLowerCase().includes(q) ||
        mr.requestedBy.toLowerCase().includes(q)
    );
  }, [normalizedMRs, searchQuery]);

  /* ===================== EXPORT ===================== */
  const handleExport = () => {
    exportToCSV(
      filteredMRs.map((mr) => ({
        'MR No': mr.reqNo,
        'Requested By': mr.requestedBy,
        Items: mr.itemsCount,
        Status: mr.status,
        Date: formatDate(mr.createdAt),
      })),
      `material-requisitions-${new Date().toISOString().split('T')[0]}`
    );
  };

  /* ===================== LOADING ===================== */
  if (isLoading || loadingProjects) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ===================== UI ===================== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Material Requisitions</h1>
          <p className="text-muted-foreground">
            Project-wise material requests
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!filteredMRs.length}
            onClick={handleExport}
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

      {/* Project Selector */}
      <Card>
        <CardContent className="pt-6">
          <SearchableSelect
            options={projectOptions}
            value={projectId ? String(projectId) : undefined}
            onChange={(val) => setProjectId(Number(val))}
            placeholder="Select Project..."
            searchPlaceholder="Search projects..."
            emptyMessage="No projects found"
          />
        </CardContent>
      </Card>

      {!projectId ? (
        <EmptyState
          icon={Building2}
          title="Select a Project"
          description="Material Requisitions are project-specific"
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by MR No or Requester..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent>
            {filteredMRs.length ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>MR No</TableHead>
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
                        <TableCell>{mr.itemsCount}</TableCell>
                        <TableCell>{mr.requestedBy}</TableCell>
                        <TableCell>{formatDate(mr.createdAt)}</TableCell>
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
                description="Create your first MR for this project"
                action={{
                  label: 'Create MR',
                  onClick: () => navigate('/purchase/mrs/new'),
                }}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
