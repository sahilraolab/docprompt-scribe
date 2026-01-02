import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  CheckCircle,
  Lock,
  DollarSign,
  Loader2
} from 'lucide-react';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils/format';

import { useMasterProjects } from '@/lib/hooks/useMasters';
import { budgetApi } from '@/lib/api/engineeringApi';
import { useApproveBudget } from '@/lib/hooks/useEngineering';

/* =====================================================
   STATUS UI MAP
===================================================== */
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20'
};

export default function BudgetList() {
  const navigate = useNavigate();
  const approveBudget = useApproveBudget();

  const { data: projects = [] } = useMasterProjects();

  const [loading, setLoading] = useState(false);
  const [approveId, setApproveId] = useState<number | null>(null);

  /**
   * budgets[projectId] = budget | null
   */
  const [budgets, setBudgets] = useState<Record<number, any | null>>({});

  /* =====================================================
     LOAD BUDGET PER PROJECT
  ===================================================== */
  useEffect(() => {
    if (!projects.length) return;

    (async () => {
      setLoading(true);
      const map: Record<number, any | null> = {};

      for (const project of projects) {
        try {
          const res = await budgetApi.getByProject(project.id);
          map[project.id] = res ?? null;
        } catch {
          map[project.id] = null;
        }
      }

      setBudgets(map);
      setLoading(false);
    })();
  }, [projects]);

  /* =====================================================
     APPROVE
  ===================================================== */
  const handleApprove = () => {
    if (!approveId) return;

    approveBudget.mutate(String(approveId), {
      onSuccess: () => {
        toast.success('Budget approved');
        setApproveId(null);

        setBudgets(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(pid => {
            if (updated[Number(pid)]?.id === approveId) {
              updated[Number(pid)] = {
                ...updated[Number(pid)],
                status: 'APPROVED'
              };
            }
          });
          return updated;
        });
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to approve budget');
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Budgets"
        description="Each project can have one approved budget"
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Total Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.map((project: any) => {
                const budget = budgets[project.id];

                return (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {project.code}
                      </div>
                    </TableCell>

                    <TableCell>
                      {budget
                        ? formatCurrency(budget.totalBudget)
                        : '—'}
                    </TableCell>

                    <TableCell>
                      {budget ? (
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[budget.status]}
                        >
                          {budget.status === 'APPROVED' && (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          {budget.status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          No budget
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      {!budget && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/engineering/budget/new?projectId=${project.id}`
                            )
                          }
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Create
                        </Button>
                      )}

                      {budget?.status === 'DRAFT' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setApproveId(budget.id)}
                        >
                          {approveBudget.isPending &&
                          approveId === budget.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      )}

                      {budget?.status === 'APPROVED' && (
                        <Lock className="h-4 w-4 text-muted-foreground inline" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Approve Budget"
        description="Once approved, this budget is locked and used for purchase & accounting controls."
        confirmText="Approve Budget"
        onConfirm={handleApprove}
      />
    </div>
  );
}
