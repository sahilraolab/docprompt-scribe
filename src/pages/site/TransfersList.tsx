import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '@/lib/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, ArrowRightLeft, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TransfersList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: transfers = [], isLoading } = useTransfers();

  const filteredTransfers = transfers.filter((transfer: any) => {
    const query = searchQuery.toLowerCase();
    return (
      transfer.transferNo?.toLowerCase().includes(query) ||
      transfer.fromProjectId?.name?.toLowerCase().includes(query) ||
      transfer.toProjectId?.name?.toLowerCase().includes(query)
    );
  });

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
          <h1 className="text-3xl font-bold">Stock Transfers</h1>
          <p className="text-muted-foreground">Transfer materials between project sites</p>
        </div>
        <Button onClick={() => navigate('/site/transfers/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by transfer no or project name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransfers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer No</TableHead>
                    <TableHead>From Project</TableHead>
                    <TableHead>To Project</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Transferred By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer: any) => (
                    <TableRow
                      key={transfer._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/transfers/${transfer._id}`)}
                    >
                      <TableCell className="font-medium">{transfer.transferNo}</TableCell>
                      <TableCell>{transfer.fromProjectId?.name || 'N/A'}</TableCell>
                      <TableCell>{transfer.toProjectId?.name || 'N/A'}</TableCell>
                      <TableCell>{transfer.items?.length || 0} items</TableCell>
                      <TableCell>{transfer.transferredBy || 'N/A'}</TableCell>
                      <TableCell>{formatDate(transfer.transferDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={transfer.status || 'Pending'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              title="No transfers found"
              description={
                searchQuery
                  ? "No transfers match your search criteria"
                  : "Transfer stock between project sites"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Transfer",
                      onClick: () => navigate('/site/transfers/new'),
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
