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
import { Plus, Search, DollarSign, CheckCircle } from 'lucide-react';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useApproveBudget } from '@/lib/hooks/useEngineering';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils/format';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function BudgetList() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useMasterProjects();
  const approveBudget = useApproveBudget();
  const [search, setSearch] = useState('');

  const projectsArray = Array.isArray(projects) ? projects : [];
  
  const filtered = projectsArray.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Budgets"
        description="Manage project budget allocations"
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
                placeholder="Search projects..."
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
              description="Create your first project budget"
              action={{ label: 'Create Budget', onClick: () => navigate('/engineering/budget/new') }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Code</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project: any) => (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/engineering/budget/${project.id}`)}>
                    <TableCell className="font-mono text-sm">{project.code}</TableCell>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(project.budget || 0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[project.status] || STATUS_COLORS.DRAFT}>
                        {project.status || 'PLANNED'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          approveBudget.mutate(String(project.id));
                        }}
                        disabled={project.status === 'APPROVED'}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
