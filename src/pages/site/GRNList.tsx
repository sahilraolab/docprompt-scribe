import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function GRNList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const grns = [
    {
      id: '1',
      grnNo: 'GRN-2024-001',
      poCode: 'PO-2024-001',
      supplierName: 'ABC Suppliers',
      projectName: 'Green Valley Apartments',
      receivedDate: '2024-01-15',
      itemsCount: 5,
      status: 'Received' as const,
      receivedBy: 'John Doe',
    },
    {
      id: '2',
      grnNo: 'GRN-2024-002',
      poCode: 'PO-2024-002',
      supplierName: 'XYZ Trading',
      projectName: 'City Mall Extension',
      receivedDate: '2024-01-18',
      itemsCount: 3,
      status: 'Pending' as const,
      receivedBy: 'Jane Smith',
    },
    {
      id: '3',
      grnNo: 'GRN-2024-003',
      poCode: 'PO-2024-003',
      supplierName: 'BuildMart',
      projectName: 'Smart Office Tower',
      receivedDate: '2024-01-20',
      itemsCount: 8,
      status: 'Approved' as const,
      receivedBy: 'Mike Johnson',
    },
  ];

  const filteredGRNs = grns.filter((grn) =>
    grn.grnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grn.poCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grn.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grn.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goods Receipt Notes (GRN)</h1>
          <p className="text-muted-foreground">Track material receipts from suppliers</p>
        </div>
        <Button onClick={() => navigate('/site/grn/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New GRN
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by GRN no, PO code, supplier, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredGRNs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>GRN No</TableHead>
                    <TableHead>PO Code</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Received By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGRNs.map((grn) => (
                    <TableRow
                      key={grn.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/grn/${grn.id}`)}
                    >
                      <TableCell className="font-medium">{grn.grnNo}</TableCell>
                      <TableCell>{grn.poCode}</TableCell>
                      <TableCell>{grn.supplierName}</TableCell>
                      <TableCell>{grn.projectName}</TableCell>
                      <TableCell>{grn.itemsCount} items</TableCell>
                      <TableCell>{grn.receivedBy}</TableCell>
                      <TableCell>{formatDate(grn.receivedDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={grn.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No GRNs found"
              description={
                searchQuery
                  ? "No GRNs match your search criteria"
                  : "Record goods receipts from purchase orders"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create GRN",
                      onClick: () => navigate('/site/grn/new'),
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
