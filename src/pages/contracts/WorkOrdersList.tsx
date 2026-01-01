import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '@/lib/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Loader2, Lock, Eye, Edit2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20',
  COMPLETED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  CANCELLED: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function WorkOrdersList() {
  const navigate = useNavigate();
  const { data: workOrders, isLoading } = useWorkOrders();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering logic
  const filteredWOs = workOrders?.filter((wo) => {
    const code = wo.code?.toLowerCase() || '';
    const contractor = wo.contractorId?.name?.toLowerCase() || '';
    const project = wo.projectId?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return code.includes(query) || contractor.includes(query) || project.includes(query);
  });

  // Status-based locking: APPROVED, COMPLETED, CANCELLED = locked
  const isLocked = (status: string) => ['APPROVED', 'COMPLETED', 'CANCELLED'].includes(status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Manage subcontractor work orders. Approved orders are locked.</p>
        </div>
        <Button onClick={() => navigate('/contracts/work-orders/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by WO code, contractor, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredWOs && filteredWOs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO Code</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWOs.map((wo) => {
                    const locked = isLocked(wo.status);
                    return (
                      <TableRow
                        key={wo._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/contracts/work-orders/${wo._id}`)}
                      >
                        <TableCell className="font-medium">{wo.code}</TableCell>
                        <TableCell>{wo.contractorId?.name || '—'}</TableCell>
                        <TableCell>{wo.projectId?.name || '—'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(wo.amount)}
                        </TableCell>
                        <TableCell>{formatPercent(wo.progress)}</TableCell>
                        <TableCell>{formatDate(wo.startDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_COLORS[wo.status] || STATUS_COLORS.DRAFT}>
                            {locked && <Lock className="h-3 w-3 mr-1" />}
                            {wo.status}
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
                                    navigate(`/contracts/work-orders/${wo._id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!locked) navigate(`/contracts/work-orders/${wo._id}/edit`);
                                  }}
                                  disabled={locked}
                                >
                                  <Edit2 className={`h-4 w-4 ${locked ? 'text-muted-foreground' : ''}`} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{locked ? 'Locked' : 'Edit'}</TooltipContent>
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
              title="No work orders found"
              description={
                searchQuery
                  ? 'No work orders match your search criteria'
                  : 'Create work orders for subcontractor assignments'
              }
              action={
                !searchQuery
                  ? {
                      label: 'Create Work Order',
                      onClick: () => navigate('/contracts/work-orders/new'),
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
