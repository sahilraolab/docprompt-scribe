import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Calendar, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PlansList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: plansData, isLoading } = usePlans();

  const plans = plansData?.data || [];

  const filteredPlans = plans.filter((plan: any) =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.projectId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Plans & Tasks</h1>
          <p className="text-muted-foreground">Manage project timelines, milestones and tasks</p>
        </div>
        <Button onClick={() => navigate('/engineering/plans/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by plan or project name..."
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
          ) : filteredPlans.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan: any) => (
                    <TableRow
                      key={plan._id || plan.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/engineering/plans/${plan._id || plan.id}`)}
                    >
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {plan.projectId?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </div>
                      </TableCell>
                      <TableCell>{plan.assignedTo?.name || 'Unassigned'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={plan.progress || 0} className="h-2" />
                          <span className="text-xs text-muted-foreground">{plan.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={plan.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No plans found"
              description={
                searchQuery
                  ? "No plans match your search criteria"
                  : "Create project plans to manage timelines and tasks"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Plan",
                      onClick: () => navigate('/engineering/plans/new'),
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
