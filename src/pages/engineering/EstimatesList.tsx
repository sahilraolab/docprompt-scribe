import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  Plus,
  Search,
  FileText,
  Loader2,
  CheckCircle,
  Lock,
  GitBranch
} from 'lucide-react';

import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useApproveEstimate } from '@/lib/hooks/useEngineering';
import { estimatesApi } from '@/lib/api/engineeringApi';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  FINAL: 'bg-green-500/10 text-green-600 border-green-500/20'
};

export default function EstimatesList() {
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState<number | null>(null);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [approveId, setApproveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: projects = [] } = useMasterProjects();
  const approveEstimate = useApproveEstimate();

  /* ================= PROJECT INIT ================= */

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  /* ================= LOAD ESTIMATES ================= */

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      try {
        setLoading(true);
        const data = await estimatesApi.list(projectId);
        setEstimates(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load estimates');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  /* ================= FILTER ================= */

  const filtered = estimates.filter(est =>
    est.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================= ACTIONS ================= */

  const handleApprove = async () => {
    if (!approveId) return;

    approveEstimate.mutate(approveId, {
      onSuccess: () => {
        toast.success('Estimate finalized');
        setApproveId(null);
        setEstimates(prev =>
          prev.map(e =>
            e.id === approveId ? { ...e, status: 'FINAL' } : e
          )
        );
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to finalize estimate');
      }
    });
  };

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Estimates</h1>
          <p className="text-muted-foreground">
            Manage project cost estimates with version control
          </p>
        </div>

        <Button onClick={() => navigate('/engineering/estimates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {/* Project Selector */}
      <div className="w-full md:w-72">
        <Select
          value={projectId?.toString()}
          onValueChange={v => setProjectId(Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name} ({p.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search estimate name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estimate Name</TableHead>
                    <TableHead className="text-right">Base Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(est => {
                    const isFinal = est.status === 'FINAL';

                    return (
                      <TableRow key={est.id}>
                        <TableCell
                          className="font-medium cursor-pointer"
                          onClick={() =>
                            navigate(`/engineering/estimates/${est.id}`)
                          }
                        >
                          {est.name || 'Unnamed Estimate'}
                        </TableCell>

                        <TableCell className="text-right font-semibold">
                          {formatCurrency(est.baseAmount || 0)}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {formatDate(est.createdAt)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={STATUS_COLORS[est.status]}
                          >
                            {isFinal && <Lock className="h-3 w-3 mr-1" />}
                            {est.status}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isFinal}
                              onClick={() =>
                                navigate(`/engineering/estimates/${est.id}`)
                              }
                            >
                              <GitBranch className="h-4 w-4 text-blue-600" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isFinal}
                              onClick={() => setApproveId(est.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No estimates found"
              description={
                searchQuery
                  ? 'No estimates match your search'
                  : 'Create estimates to begin planning'
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Finalize Estimate"
        description="Once finalized, this estimate becomes FINAL and cannot be modified. Are you sure?"
        confirmText="Finalize"
        onConfirm={handleApprove}
      />
    </div>
  );
}
