import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ArrowLeft, Edit, FileText, Download, Loader2 } from 'lucide-react';
import { useWorkOrder } from '@/lib/hooks/useContracts';
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
  const { data: workOrder, isLoading } = useWorkOrder(id);

  if (isLoading || !workOrder) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalCompleted = workOrder.items?.reduce((sum, item) => sum + ((item.qty * item.rate) * (item.progress || 0) / 100), 0) || 0;
  const totalAmount = workOrder.items?.reduce((sum, item) => sum + (item.qty * item.rate), 0) || workOrder.amount || 0;

  // Mock extended data for display
  const displayData = {
    code: workOrder.code,
    contractorName: workOrder.contractorId?.name || 'N/A',
    projectName: workOrder.projectId?.name || 'N/A',
    workDescription: workOrder.workDescription,
    scopeOfWork: workOrder.scopeOfWork?.split('\n') || [],
    amount: workOrder.amount,
    advanceAmount: (workOrder.amount * (workOrder.advancePct || 10)) / 100,
    progressPct: workOrder.progress || 0,
    startDate: workOrder.startDate,
    endDate: workOrder.endDate,
    status: workOrder.status,
    paymentTerms: workOrder.paymentTerms,
    penaltyClause: workOrder.penaltyClause,
    workItems: workOrder.items || [],
    createdAt: workOrder.createdAt,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/work-orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{displayData.code}</h1>
            <p className="text-muted-foreground">{displayData.contractorName}</p>
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
              <p className="text-2xl font-bold">{formatCurrency(displayData.amount)}</p>
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
                <p className="text-2xl font-bold">{displayData.progressPct}%</p>
                <Progress value={displayData.progressPct} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={displayData.status} />
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
                <p className="font-medium">{displayData.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contractor</p>
                <p className="font-medium">{displayData.contractorName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(displayData.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(displayData.endDate)}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Work Description</p>
              <p className="text-sm">{displayData.workDescription}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Scope of Work</p>
              <ul className="list-disc list-inside space-y-1">
                {displayData.scopeOfWork.map((item, idx) => (
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
                <p className="text-lg font-bold">{formatCurrency(displayData.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Advance Amount</p>
                <p className="text-lg font-bold">{formatCurrency(displayData.advanceAmount)}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Payment Terms</p>
              <p className="text-sm">{displayData.paymentTerms || 'As per agreement'}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Penalty Clause</p>
              <p className="text-sm text-amber-600">{displayData.penaltyClause || 'N/A'}</p>
            </div>
            <Separator />
            <div className="text-sm">
              <p className="text-muted-foreground">Created At</p>
              <p>{formatDate(displayData.createdAt)}</p>
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
                {displayData.workItems.map((item, idx) => {
                  const itemAmount = item.qty * item.rate;
                  const itemProgress = item.progress || 0;
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{formatCurrency(item.rate, 'full')}</TableCell>
                      <TableCell>{formatCurrency(itemAmount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={itemProgress} className="w-20" />
                          <span className="text-sm">{itemProgress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(itemAmount * itemProgress / 100)}
                      </TableCell>
                    </TableRow>
                  );
                })}
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

    </div>
  );
}
