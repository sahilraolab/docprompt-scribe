import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimates, useApproveEstimate } from '@/lib/hooks/useEngineering';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Loader2, CheckCircle, Lock, GitBranch } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  FINAL: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function EstimatesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [approveId, setApproveId] = useState<string | null>(null);
  
  const { data: estimates = [], isLoading } = useEstimates();
  const { data: projects = [] } = useMasterProjects();
  const approveEstimate = useApproveEstimate();

  const estimatesArray = Array.isArray(estimates) ? estimates : [];
  const projectsArray = Array.isArray(projects) ? projects : [];

  // Enrich estimates with project names
  const enrichedEstimates = estimatesArray.map((est: any) => {
    const project = projectsArray.find((p: any) => String(p.id) === String(est.projectId));
    return {
      ...est,
      projectName: project?.name || 'Unknown Project',
      projectCode: project?.code || 'N/A',
    };
  });

  const filteredEstimates = enrichedEstimates.filter((est: any) =>
    est.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.projectCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = () => {
    if (approveId) {
      approveEstimate.mutate(approveId, {
        onSettled: () => setApproveId(null),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Estimates</h1>
          <p className="text-muted-foreground">Manage project cost estimates with version control. Final estimates are required for Purchase.</p>
        </div>
        <Button onClick={() => navigate('/engineering/estimates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project name, code, or estimate name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEstimates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Estimate Name</TableHead>
                    <TableHead className="text-right">Base Amount</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstimates.map((est: any) => {
                    const isLocked = est.status === 'FINAL';
                    return (
                      <TableRow
                        key={est.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/engineering/estimates/${est.id}`)}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <span>{est.projectName}</span>
                            <span className="text-xs text-muted-foreground ml-2">({est.projectCode})</span>
                          </div>
                        </TableCell>
                        <TableCell>{est.name || 'Unnamed Estimate'}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(est.baseAmount || 0)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(est.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_COLORS[est.status] || STATUS_COLORS.DRAFT}>
                            {isLocked && <Lock className="h-3 w-3 mr-1" />}
                            {est.status || 'DRAFT'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/engineering/estimates/${est.id}`);
                                  }}
                                  title="Add version"
                                  disabled={isLocked}
                                >
                                  <GitBranch className={`h-4 w-4 ${isLocked ? 'text-muted-foreground' : 'text-blue-600'}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Add version</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setApproveId(String(est.id));
                                  }}
                                  disabled={isLocked || approveEstimate.isPending}
                                  title={isLocked ? 'Already finalized' : 'Finalize estimate'}
                                >
                                  {approveEstimate.isPending && approveId === String(est.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className={`h-4 w-4 ${isLocked ? 'text-muted-foreground' : 'text-green-600'}`} />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{isLocked ? 'Already finalized' : 'Finalize estimate'}</TooltipContent>
                            </Tooltip>
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
                  ? "No estimates match your search criteria"
                  : "Create project estimates to track costs"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Estimate",
                      onClick: () => navigate('/engineering/estimates/new'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Finalize Estimate"
        description="Once finalized, this estimate becomes FINAL and cannot be modified. Final estimates are required for creating Material Requisitions in Purchase module. Are you sure you want to finalize?"
        onConfirm={handleApprove}
        confirmText="Finalize Estimate"
        variant="default"
      />
    </div>
  );
}
