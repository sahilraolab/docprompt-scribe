import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePOs } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { downloadCSV, prepareDataForExport } from '@/lib/utils/export-enhanced';
import { Plus, Search, FileText, Loader2, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PurchaseOrdersList() {
  const navigate = useNavigate();
  const { data: pos, isLoading } = usePOs();
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ Normalize data safely
  const normalizedPOs = pos?.map((po: any) => ({
    id: po._id,
    code: po.code,
    supplierName: po.supplierId?.name || '—',
    projectName: po.projectId?.name || '—',
    projectCode: po.projectId?.code || '',
    amount: po.totalAmount ?? 0,
    poDate: po.poDate,
    status: po.status,
    approvalStatus: po.approvals?.length
      ? po.approvals[po.approvals.length - 1].status
      : null,
  })) || [];

  // ✅ Search logic
  const filteredPOs = normalizedPOs.filter(
    (po) =>
      po.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.projectCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ Export logic
  const handleExport = () => {
    if (!filteredPOs.length) return;
    const exportData = prepareDataForExport(filteredPOs);
    downloadCSV(
      exportData,
      `purchase-orders-${new Date().toISOString().split('T')[0]}`,
      ['code', 'supplierName', 'projectName', 'amount', 'poDate', 'status']
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and approvals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!filteredPOs.length}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/purchase/pos/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New PO
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by PO code, supplier, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredPOs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Code</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredPOs.map((po) => (
                    <TableRow
                      key={po.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/purchase/pos/${po.id}`)}
                    >
                      <TableCell className="font-medium">{po.code}</TableCell>
                      <TableCell>{po.supplierName}</TableCell>
                      <TableCell>{po.projectName}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(po.amount)}
                      </TableCell>
                      <TableCell>{formatDate(po.poDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={po.status} />
                      </TableCell>
                      <TableCell>
                        {po.approvalStatus && (
                          <StatusBadge status={po.approvalStatus} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No purchase orders found"
              description={
                searchQuery
                  ? 'No POs match your search criteria'
                  : 'Create purchase orders for material procurement'
              }
              action={
                !searchQuery
                  ? {
                      label: 'Create PO',
                      onClick: () => navigate('/purchase/pos/new'),
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
