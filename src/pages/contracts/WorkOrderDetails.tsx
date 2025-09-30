import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ArrowLeft, Edit, FileText, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function WorkOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const workOrder = {
    id: '1',
    code: 'WO-2024-001',
    contractorId: '1',
    contractorName: 'BuildPro Contractors',
    projectId: '1',
    projectName: 'Green Valley Apartments',
    workDescription: 'Civil construction work for Phase 1 including foundation, structure, and finishing',
    scopeOfWork: [
      'Excavation and foundation work',
      'RCC structure up to 4 floors',
      'Plastering and finishing',
      'Electrical conduit installation',
      'Plumbing rough-in',
    ],
    amount: 8500000,
    advanceAmount: 1700000,
    advancePaid: 1700000,
    progressPct: 65,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    actualStartDate: '2024-01-20',
    estimatedCompletionDate: '2024-07-15',
    status: 'Active' as const,
    paymentTerms: '70% on completion, 20% on milestones, 10% advance',
    penaltyClause: '0.5% per day for delay beyond 15 days',
    workItems: [
      { id: '1', description: 'Foundation work', unit: 'SQM', qty: 500, rate: 2500, amount: 1250000, completed: 100 },
      { id: '2', description: 'RCC Structure', unit: 'CUM', qty: 800, rate: 6500, amount: 5200000, completed: 75 },
      { id: '3', description: 'Plastering', unit: 'SQM', qty: 2000, rate: 450, amount: 900000, completed: 50 },
      { id: '4', description: 'Electrical work', unit: 'Point', qty: 300, rate: 800, amount: 240000, completed: 40 },
      { id: '5', description: 'Plumbing work', unit: 'Point', qty: 150, rate: 1200, amount: 180000, completed: 30 },
    ],
    milestones: [
      { id: '1', name: 'Foundation Complete', date: '2024-02-15', status: 'Completed', payment: 1000000 },
      { id: '2', name: 'Structure 50%', date: '2024-04-15', status: 'Completed', payment: 1500000 },
      { id: '3', name: 'Structure Complete', date: '2024-06-01', status: 'In Progress', payment: 2000000 },
      { id: '4', name: 'Finishing 50%', date: '2024-07-15', status: 'Pending', payment: 1500000 },
    ],
    createdBy: 'Project Manager',
    createdAt: '2024-01-10',
    approvedBy: 'Director',
    approvedAt: '2024-01-12',
  };

  const totalCompleted = workOrder.workItems.reduce((sum, item) => sum + (item.amount * item.completed / 100), 0);
  const totalAmount = workOrder.workItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/work-orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{workOrder.code}</h1>
            <p className="text-muted-foreground">{workOrder.contractorName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={() => navigate(`/contracts/work-orders/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(workOrder.amount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed Value</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCompleted)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Progress</p>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{workOrder.progressPct}%</p>
                <Progress value={workOrder.progressPct} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={workOrder.status} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{workOrder.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contractor</p>
                <p className="font-medium">{workOrder.contractorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(workOrder.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(workOrder.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actual Start</p>
                <p className="font-medium">{formatDate(workOrder.actualStartDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Completion</p>
                <p className="font-medium">{formatDate(workOrder.estimatedCompletionDate)}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Work Description</p>
              <p className="text-sm">{workOrder.workDescription}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Scope of Work</p>
              <ul className="list-disc list-inside space-y-1">
                {workOrder.scopeOfWork.map((item, idx) => (
                  <li key={idx} className="text-sm">{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment & Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Payment & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Contract Amount</p>
                <p className="text-lg font-bold">{formatCurrency(workOrder.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Advance Amount</p>
                <p className="text-lg font-bold">{formatCurrency(workOrder.advanceAmount)}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Payment Terms</p>
              <p className="text-sm">{workOrder.paymentTerms}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Penalty Clause</p>
              <p className="text-sm text-amber-600">{workOrder.penaltyClause}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Created By</p>
                <p>{workOrder.createdBy}</p>
                <p className="text-xs text-muted-foreground">{formatDate(workOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Approved By</p>
                <p>{workOrder.approvedBy}</p>
                <p className="text-xs text-muted-foreground">{formatDate(workOrder.approvedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Items */}
      <Card>
        <CardHeader>
          <CardTitle>Work Items Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Value Done</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrder.workItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{formatCurrency(item.rate, 'full')}</TableCell>
                    <TableCell>{formatCurrency(item.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={item.completed} className="w-20" />
                        <span className="text-sm">{item.completed}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.amount * item.completed / 100)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={4} className="font-bold">Total</TableCell>
                  <TableCell className="font-bold">{formatCurrency(totalAmount)}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(totalCompleted)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workOrder.milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(milestone.date)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(milestone.payment)}</p>
                  </div>
                  <Badge variant={
                    milestone.status === 'Completed' ? 'default' :
                    milestone.status === 'In Progress' ? 'secondary' : 'outline'
                  }>
                    {milestone.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
