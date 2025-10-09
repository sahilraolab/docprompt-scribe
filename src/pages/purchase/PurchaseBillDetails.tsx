import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

async function fetchPurchaseBill(id: string) {
  const response = await fetch(`/api/purchase-bills/${id}`);
  if (!response.ok) throw new Error('Failed to fetch purchase bill');
  return response.json();
}

export default function PurchaseBillDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: bill, isLoading } = useQuery({
    queryKey: ['purchase-bills', id],
    queryFn: () => fetchPurchaseBill(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!bill) return <div>Purchase bill not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/bills')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Purchase Bill Details</h1>
            <p className="text-muted-foreground">{bill.invoiceNo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/purchase/bills/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{bill.invoiceNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={bill.status === 'Paid' ? 'default' : 'secondary'}>
                  {bill.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PO Code</p>
                <p className="font-medium">{bill.poCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-medium">{formatDate(bill.invoiceDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amount Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{formatCurrency(bill.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax:</span>
              <span className="font-medium">{formatCurrency(bill.tax)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
