import { useParams, useNavigate } from 'react-router-dom';
import { usePO } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ArrowLeft, Edit, Loader2, Building, User, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PODetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading } = usePO(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Purchase Order Not Found</h2>
        <Button onClick={() => navigate('/purchase/pos')}>Back to Purchase Orders</Button>
      </div>
    );
  }

  const approvalStatus =
    po.approvals && po.approvals.length > 0
      ? po.approvals[po.approvals.length - 1].status
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/pos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{po.code}</h1>
            <StatusBadge status={po.status} />
            {approvalStatus && <StatusBadge status={approvalStatus} />}
          </div>
          <p className="text-muted-foreground">Purchase Order Details</p>
        </div>
        <Button onClick={() => navigate(`/purchase/pos/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Supplier + Project Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Supplier Name</p>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{po.supplierId?.name || '—'}</p>
              </div>
            </div>
            {po.supplierId?.email && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{po.supplierId.email}</p>
              </div>
            )}
            {po.supplierId?.phone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{po.supplierId.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project</p>
              <p className="font-medium">
                {po.projectId?.name || '—'}{' '}
                {po.projectId?.code && <span className="text-muted-foreground">({po.projectId.code})</span>}
              </p>
            </div>
            {po.deliveryDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{formatDate(po.deliveryDate)}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">PO Date</p>
              <p className="font-medium">{formatDate(po.poDate)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>UoM</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Tax %</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {po.items?.length > 0 ? (
                  po.items.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right">{item.taxPercent}%</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No items added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(po.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span className="font-medium">{formatCurrency(po.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(po.totalAmount)}</span>
            </div>
          </div>

          {/* Terms */}
          {po.terms && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Terms & Conditions</p>
              <p className="text-sm text-muted-foreground">{po.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Created / Approval Info */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created By</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{po.createdBy?.name || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created At</p>
              <p className="font-medium">{formatDate(po.createdAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
