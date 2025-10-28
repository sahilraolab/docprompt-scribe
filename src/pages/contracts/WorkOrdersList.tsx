import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkOrders } from '@/lib/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function WorkOrdersList() {
  const navigate = useNavigate();
  const { data: workOrders, isLoading } = useWorkOrders();
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Filtering logic (use correct field names)
  const filteredWOs = workOrders?.filter((wo) => {
    const code = wo.code?.toLowerCase() || '';
    const contractor = wo.contractorId?.name?.toLowerCase() || '';
    const project = wo.projectId?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return code.includes(query) || contractor.includes(query) || project.includes(query);
  });

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ✅ Main view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders</h1>
          <p className="text-muted-foreground">Manage subcontractor work orders</p>
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
                    <TableHead>Amount</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWOs.map((wo) => (
                    <TableRow
                      key={wo._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/contracts/work-orders/${wo._id}`)}
                    >
                      <TableCell className="font-medium">{wo.code}</TableCell>
                      <TableCell>{wo.contractorId?.name || '—'}</TableCell>
                      <TableCell>{wo.projectId?.name || '—'}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(wo.amount)}
                      </TableCell>
                      <TableCell>{formatPercent(wo.progress)}</TableCell>
                      <TableCell>{formatDate(wo.startDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={wo.status} />
                      </TableCell>
                    </TableRow>
                  ))}
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
