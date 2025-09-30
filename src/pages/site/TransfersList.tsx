import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, ArrowRightLeft } from 'lucide-react';
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

  // Mock data
  const transfers = [
    {
      id: '1',
      transferNo: 'TRF-2024-001',
      fromProject: 'Green Valley Apartments',
      toProject: 'City Mall Extension',
      itemsCount: 3,
      transferDate: '2024-01-15',
      status: 'Sent' as const,
      transferredBy: 'Store Manager',
    },
    {
      id: '2',
      transferNo: 'TRF-2024-002',
      fromProject: 'Smart Office Tower',
      toProject: 'Green Valley Apartments',
      itemsCount: 5,
      transferDate: '2024-01-18',
      status: 'Pending' as const,
      transferredBy: 'Site Manager',
    },
    {
      id: '3',
      transferNo: 'TRF-2024-003',
      fromProject: 'City Mall Extension',
      toProject: 'Smart Office Tower',
      itemsCount: 2,
      transferDate: '2024-01-20',
      status: 'Received' as const,
      transferredBy: 'Store Manager',
    },
  ];

  const filteredTransfers = transfers.filter((transfer) =>
    transfer.transferNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.fromProject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transfer.toProject.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  {filteredTransfers.map((transfer) => (
                    <TableRow
                      key={transfer.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/transfers/${transfer.id}`)}
                    >
                      <TableCell className="font-medium">{transfer.transferNo}</TableCell>
                      <TableCell>{transfer.fromProject}</TableCell>
                      <TableCell>{transfer.toProject}</TableCell>
                      <TableCell>{transfer.itemsCount} items</TableCell>
                      <TableCell>{transfer.transferredBy}</TableCell>
                      <TableCell>{formatDate(transfer.transferDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={transfer.status} />
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
