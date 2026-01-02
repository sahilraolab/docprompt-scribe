import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Plus,
  Search,
  BarChart3,
  Lock,
  CheckCircle,
  Loader2
} from 'lucide-react';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/format';

import { useMasterProjects } from '@/lib/hooks/useMasters';
import { bbsApi } from '@/lib/api/engineeringApi';
import { useApproveBBS } from '@/lib/hooks/useEngineering';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20'
};

export default function BBSList() {
  const navigate = useNavigate();

  const { data: projects = [] } = useMasterProjects();
  const approveBBS = useApproveBBS();

  const [projectId, setProjectId] = useState<number | null>(null);
  const [bbsList, setBBSList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [approveId, setApproveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  /* ================= INIT PROJECT ================= */

  useEffect(() => {
    if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [projects]);

  /* ================= LOAD BBS ================= */

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      try {
        setLoading(true);
        const data = await bbsApi.getByProject(projectId);
        setBBSList(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load BBS records');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  /* ================= FILTER ================= */

  const filtered = bbsList.filter(b =>
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    b.description?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= ACTIONS ================= */

  const handleApprove = () => {
    if (!approveId) return;

    approveBBS.mutate(approveId, {
      onSuccess: () => {
        toast.success('BBS approved');
        setApproveId(null);
        setBBSList(prev =>
          prev.map(b =>
            b.id === approveId ? { ...b, status: 'APPROVED' } : b
          )
        );
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to approve BBS');
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bar Bending Schedule (BBS)"
        description="BBS defines execution quantities for Work Orders and RA Bills"
        actions={[
          {
            label: 'Add BBS',
            onClick: () => navigate('/engineering/bbs/new'),
            icon: Plus
          }
        ]}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search BBS..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No BBS records"
              description="Create BBS from approved estimates"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map(bbs => {
                  const isApproved = bbs.status === 'APPROVED';

                  return (
                    <TableRow key={bbs.id}>
                      <TableCell className="font-mono">{bbs.code}</TableCell>
                      <TableCell>{bbs.description || '-'}</TableCell>
                      <TableCell className="text-right">{bbs.quantity}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(bbs.rate)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(bbs.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[bbs.status]}
                        >
                          {isApproved && <Lock className="h-3 w-3 mr-1" />}
                          {bbs.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isApproved}
                              onClick={() => setApproveId(bbs.id)}
                            >
                              {approveBBS.isPending &&
                              approveId === bbs.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isApproved ? 'Already approved' : 'Approve BBS'}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve BBS?</AlertDialogTitle>
            <AlertDialogDescription>
              Approved BBS becomes locked and is used for execution tracking.
              This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
