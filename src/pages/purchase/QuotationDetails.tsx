import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useQuotation, useApproveQuotation, useRejectQuotation } from '@/lib/hooks/usePurchaseBackend';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading } = useQuotation(id || '');
  const approveQuotation = useApproveQuotation();
  const rejectQuotation = useRejectQuotation();

  const quotation = response?.data || response; // Handle both cases

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Quotation Not Found</h2>
        <Button onClick={() => navigate('/purchase/quotations')}>Back to List</Button>
      </div>
    );
  }

  const supplierName = quotation.supplierId?.name || 'N/A';
  const supplierCode = quotation.supplierId?.code || '';
  const mrCode = quotation.mrId?.code || 'N/A';
  const status = quotation.status || 'Draft';
  const validUntil = quotation.validUntil ? formatDate(quotation.validUntil) : '-';
  const createdAt = quotation.createdAt ? formatDate(quotation.createdAt) : '-';
  const quotationDate = quotation.quotationDate ? formatDate(quotation.quotationDate) : '-';
  const remarks = quotation.remarks || '-';

  const subtotal = quotation.items?.reduce((sum: number, i: any) => sum + i.amount, 0) || 0;
  const taxTotal = quotation.items?.reduce(
    (sum: number, i: any) => sum + (i.amount * (i.taxPercent || 0)) / 100,
    0
  );
  const total = subtotal + taxTotal;

  const handleApprove = () => {
    approveQuotation.mutate(
      { id: id || '', data: { status: 'Selected' } },
      {
        onSuccess: () => {
          toast.success('Quotation approved successfully');
          navigate('/purchase/quotations');
        },
        onError: (error: any) =>
          toast.error(error.message || 'Failed to approve quotation'),
      }
    );
  };

  const handleReject = () => {
    rejectQuotation.mutate(
      { id: id || '', data: { status: 'Rejected' } },
      {
        onSuccess: () => {
          toast.success('Quotation rejected');
          navigate('/purchase/quotations');
        },
        onError: (error: any) =>
          toast.error(error.message || 'Failed to reject quotation'),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/quotations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quotation Details</h1>
            <p className="text-muted-foreground">{quotation.code}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {status === 'Draft' && (
            <>
              <Button variant="outline" onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Approve
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => navigate(`/purchase/quotations/${id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{supplierName}</p>
                <p className="text-xs text-muted-foreground">{supplierCode}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    status === 'Selected'
                      ? 'default'
                      : status === 'Rejected'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Material Requisition</p>
                <p className="font-medium">{mrCode}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Quotation Date</p>
                <p className="font-medium">{quotationDate}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="font-medium">{validUntil}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">{createdAt}</p>
              </div>

              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Remarks</p>
                <p className="font-medium">{remarks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Total:</span>
                <span className="font-medium">{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quoted Items</CardTitle>
        </CardHeader>
        <CardContent>
          {quotation.items && quotation.items.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Tax %</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotation.items.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell>{formatCurrency(item.rate)}</TableCell>
                      <TableCell>{item.taxPercent}%</TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No items found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
