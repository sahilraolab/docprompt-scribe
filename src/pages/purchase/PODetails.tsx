import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePO, useApprovePO, useRejectPO } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ArrowLeft, Edit, Loader2, Building, User, Calendar, CheckCircle, XCircle, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function PODetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading } = usePO(id!);
  const approvePO = useApprovePO();
  const rejectPO = useRejectPO();

  const [approveConfirm, setApproveConfirm] = useState(false);
  const [rejectConfirm, setRejectConfirm] = useState(false);

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

  const isLocked = po.status === 'APPROVED' || po.status === 'CANCELLED';
  const canApprove = po.status === 'CREATED' || po.status === 'Draft';

  const handleApprove = () => {
    approvePO.mutate({ id: id! }, {
      onSuccess: () => setApproveConfirm(false),
    });
  };

  const handleReject = () => {
    rejectPO.mutate({ id: id! }, {
      onSuccess: () => {
        setRejectConfirm(false);
        navigate('/purchase/pos');
      },
    });
  };

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
            {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
          <p className="text-muted-foreground">Purchase Order Details</p>
        </div>
        <div className="flex gap-2">
          {canApprove && (
            <>
              <Button onClick={() => setApproveConfirm(true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button variant="destructive" onClick={() => setRejectConfirm(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {!isLocked && (
            <Button variant="outline" onClick={() => navigate(`/purchase/pos/${id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      {isLocked && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <p className="text-sm text-amber-800">
              <Lock className="h-4 w-4 inline mr-2" />
              This PO is <strong>{po.status}</strong> and cannot be modified.
            </p>
          </CardContent>
        </Card>
      )}

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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project</p>
              <p className="font-medium">{po.projectId?.name || '—'}</p>
            </div>
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
                      <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No items</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="text-lg font-bold">
              Total: {formatCurrency(po.totalAmount)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ConfirmDialog
        open={approveConfirm}
        onOpenChange={setApproveConfirm}
        title="Approve Purchase Order"
        description="This will approve the PO and allow GRN creation and billing. Continue?"
        confirmText="Approve"
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={rejectConfirm}
        onOpenChange={setRejectConfirm}
        title="Reject Purchase Order"
        description="This will reject the PO. This action cannot be undone."
        confirmText="Reject"
        variant="destructive"
        onConfirm={handleReject}
      />
    </div>
  );
}
