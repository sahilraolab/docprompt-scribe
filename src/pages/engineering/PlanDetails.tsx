import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlan } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/utils/format';
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Helper functions
const getPriorityColor = (priority: string) => {
  const colors = {
    Low: 'bg-blue-500',
    Medium: 'bg-yellow-500',
    High: 'bg-orange-500',
    Critical: 'bg-red-500',
  };
  return colors[priority as keyof typeof colors] || 'bg-gray-500';
};

const getTaskStatusIcon = (status: string) => {
  if (status === 'Completed') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === 'Blocked') return <AlertCircle className="h-4 w-4 text-red-600" />;
  return null;
};

// Main component
export default function PlanDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch the plan data
  const { data: plan, isLoading, error } = usePlan(id!);

  useEffect(() => {
    console.log('Fetched Plan:', plan);
  }, [plan]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show fallback if no plan or error
  if (error || !plan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Plan Not Found</h2>
        <Button onClick={() => navigate('/engineering/plans')}>Back to Plans</Button>
      </div>
    );
  }

  // Calculate task completion info
  const completedTasks = plan.tasks?.filter((t: any) => t.status === 'Completed').length || 0;
  const totalTasks = plan.tasks?.length || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/plans')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <StatusBadge status={plan.status} />
          </div>
          <p className="text-muted-foreground">{plan.projectId?.name || 'N/A'}</p>
        </div>
        <Button onClick={() => navigate(`/engineering/plans/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={plan.progress || 0} className="h-2" />
              <p className="text-2xl font-bold">{plan.progress || 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {completedTasks} / {totalTasks}
              </p>
              <p className="text-sm text-muted-foreground">{taskCompletionRate}% complete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Info */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project</p>
              <p className="font-medium">
                {plan.projectId?.name || 'N/A'} ({plan.projectId?.code || 'N/A'})
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {plan.assignedTo?.name
                    ? `${plan.assignedTo.name} (${plan.assignedTo.email || 'No Email'})`
                    : 'Unassigned'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Created By</p>
              <p className="font-medium">
                {plan.createdBy?.name || 'N/A'} ({plan.createdBy?.email || 'N/A'})
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Created At</p>
              <p className="font-medium">{formatDate(plan.createdAt)}</p>
            </div>
          </div>

          {plan.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{plan.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({totalTasks})</CardTitle>
        </CardHeader>
        <CardContent>
          {plan.tasks && plan.tasks.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.tasks.map((task: any) => (
                    <TableRow key={task._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getTaskStatusIcon(task.status)}
                          {task.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {task.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(task.startDate)} - {formatDate(task.endDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No tasks added to this plan yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
