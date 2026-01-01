import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Receipt, Loader2, Lock, Eye, Edit2 } from 'lucide-react';
import { useRABills } from '@/lib/hooks/useContracts';
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
  SUBMITTED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20',
  POSTED: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  REJECTED: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function RABillsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: raBills = [], isLoading } = useRABills();

  const filteredBills = raBills.filter((bill) => {
    const query = searchQuery.toLowerCase();
    return (
      bill.billNo?.toLowerCase().includes(query) ||
      bill.workOrderId?.code?.toLowerCase().includes(query) ||
      bill.workOrderId?.contractorId?.name?.toLowerCase().includes(query) ||
      bill.workOrderId?.projectId?.name?.toLowerCase().includes(query)
    );
  });

  // Status-based locking: APPROVED or POSTED = locked
  const isLocked = (status: string) => ['APPROVED', 'POSTED'].includes(status?.toUpperCase());

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
          <h1 className="text-3xl font-bold">RA Bills</h1>
          <p className="text-muted-foreground">Running Account bills for contractors. Posted bills are locked.</p>
        </div>
        <Button onClick={() => navigate('/contracts/ra-bills/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New RA Bill
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by bill no, WO code, contractor, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredBills.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>WO Code</TableHead>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => {
                    const locked = isLocked(bill.status);
                    const statusKey = bill.status?.toUpperCase() || 'DRAFT';
                    return (
                      <TableRow
                        key={bill._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/contracts/ra-bills/${bill._id}`)}
                      >
                        <TableCell className="font-medium">{bill.billNo}</TableCell>
                        <TableCell>{bill.workOrderId?.code || 'N/A'}</TableCell>
                        <TableCell>{bill.workOrderId?.contractorId?.name || 'N/A'}</TableCell>
                        <TableCell>{bill.workOrderId?.projectId?.name || 'N/A'}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(bill.fromDate)} - {formatDate(bill.toDate)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(bill.gross)}</TableCell>
                        <TableCell className="text-right text-destructive">
                          -{formatCurrency(bill.retention)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(bill.net)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_COLORS[statusKey] || STATUS_COLORS.DRAFT}>
                            {locked && <Lock className="h-3 w-3 mr-1" />}
                            {statusKey}
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
                                    navigate(`/contracts/ra-bills/${bill._id}`);
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
                                    if (!locked) navigate(`/contracts/ra-bills/${bill._id}/edit`);
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
              icon={Receipt}
              title="No RA bills found"
              description={
                searchQuery
                  ? "No bills match your search criteria"
                  : "Create running account bills for contractor payments"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create RA Bill",
                      onClick: () => navigate('/contracts/ra-bills/new'),
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
