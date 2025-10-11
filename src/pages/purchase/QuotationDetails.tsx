import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { useQuotation } from '@/lib/hooks/usePurchaseBackend';

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: quotation, isLoading } = useQuotation(id || '');

  if (isLoading) return <LoadingSpinner />;
  if (!quotation) return <div>Quotation not found</div>;

  const total = quotation.items.reduce((sum: number, item: any) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/quotations')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quotation Details</h1>
            <p className="text-muted-foreground">{quotation.supplierName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/purchase/quotations/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Supplier</p>
                <p className="font-medium">{quotation.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={quotation.status === 'Active' ? 'default' : 'secondary'}>
                  {quotation.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MR Code</p>
                <p className="font-medium">{quotation.mrCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expires At</p>
                <p className="font-medium">{formatDate(quotation.expiresAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">{formatDate(quotation.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {quotation.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{quotation.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
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
              {quotation.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>{formatCurrency(item.rate)}</TableCell>
                  <TableCell>{item.taxPct}%</TableCell>
                  <TableCell>{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
