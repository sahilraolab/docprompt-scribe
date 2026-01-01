import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Plus, Search, DollarSign, CheckCircle, Lock, Loader2 } from 'lucide-react';
import { useBudgets, useApproveBudget } from '@/lib/hooks/useEngineering';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function BudgetList() {
  const navigate = useNavigate();
  const { data: budgets = [], isLoading } = useBudgets();
  const { data: projects = [] } = useMasterProjects();
  const approveBudget = useApproveBudget();
  const [search, setSearch] = useState('');
  const [approveId, setApproveId] = useState<string | null>(null);

  const budgetsArray = Array.isArray(budgets) ? budgets : [];
  const projectsArray = Array.isArray(projects) ? projects : [];

  // Enrich budgets with project info
  const enrichedBudgets = budgetsArray.map((budget: any) => {
    const project = projectsArray.find((p: any) => String(p.id) === String(budget.projectId));
    return {
      ...budget,
      projectName: project?.name || 'Unknown Project',
      projectCode: project?.code || 'N/A',
    };
  });

  const filtered = enrichedBudgets.filter((b: any) =>
    b.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    b.projectCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = () => {
    if (approveId) {
      approveBudget.mutate(approveId, {
        onSettled: () => setApproveId(null),
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Budgets"
        description="Manage project budget allocations. Approved budgets are locked."
        actions={[
          { label: 'Create Budget', onClick: () => navigate('/engineering/budget/new'), icon: Plus }
        ]}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by project name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No budgets found"
              description={budgetsArray.length === 0 ? "Create your first project budget" : "No budgets match your search"}
              action={budgetsArray.length === 0 ? { label: 'Create Budget', onClick: () => navigate('/engineering/budget/new') } : undefined}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Code</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead className="text-right">Total Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((budget: any) => {
                  const isLocked = budget.status === 'APPROVED';
                  return (
                    <TableRow key={budget.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{budget.projectCode}</TableCell>
                      <TableCell className="font-medium">{budget.projectName}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(budget.totalBudget || 0)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[budget.status] || STATUS_COLORS.DRAFT}>
                          {isLocked && <Lock className="h-3 w-3 mr-1" />}
                          {budget.status || 'DRAFT'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setApproveId(String(budget.id));
                          }}
                          disabled={isLocked || approveBudget.isPending}
                          title={isLocked ? 'Already approved' : 'Approve budget'}
                        >
                          {approveBudget.isPending && approveId === String(budget.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className={`h-4 w-4 ${isLocked ? 'text-muted-foreground' : 'text-green-600'}`} />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Approve Budget"
        description="Once approved, this budget becomes locked and cannot be modified. Approved budgets are required for creating Material Requisitions in Purchase module. Are you sure you want to approve?"
        onConfirm={handleApprove}
        confirmText="Approve Budget"
        variant="default"
      />
    </div>
  );
}
