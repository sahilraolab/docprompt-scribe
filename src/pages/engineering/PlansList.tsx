import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Calendar, Loader2, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

export default function PlansList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: plans = [], isLoading } = usePlans();

  // ✅ Handle both populated & non-populated assignedTo
  const getAssignedToName = (assignedTo: any) => {
    if (!assignedTo) return 'Unassigned';
    if (typeof assignedTo === 'string') return `User ID: ${assignedTo.slice(0, 6)}...`;
    return assignedTo?.name || assignedTo?.email || 'Unassigned';
  };

  // ✅ Apply filters safely
  const filteredPlans = (plans || []).filter((plan: any) => {
    const projectName = plan.projectId?.name || '';
    const planName = plan.name || '';
    return (
      planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Plans & Tasks</h1>
          <p className="text-muted-foreground">
            Manage project timelines, milestones, and team assignments
          </p>
        </div>
        <Button onClick={() => navigate('/engineering/plans/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {/* Search & Table */}
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
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/engineering/plans/${plan._id || plan.id}`)}
                    >
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.projectId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {getAssignedToName(plan.assignedTo)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={plan.progress || 0} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {plan.progress || 0}%
                          </span>
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
                  ? 'No plans match your search criteria'
                  : 'Create project plans to manage timelines and assignments'
              }
              action={
                !searchQuery
                  ? {
                      label: 'Create Plan',
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
