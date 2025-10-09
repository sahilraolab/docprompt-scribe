import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

async function fetchComparativeStatement(id: string) {
  const response = await fetch(`/api/comparative-statements/${id}`);
  if (!response.ok) throw new Error('Failed to fetch comparative statement');
  return response.json();
}

export default function ComparativeStatementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: statement, isLoading } = useQuery({
    queryKey: ['comparative-statements', id],
    queryFn: () => fetchComparativeStatement(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!statement) return <div>Comparative statement not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/comparative-statements')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Comparative Statement</h1>
            <p className="text-muted-foreground">MR: {statement.mrCode}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statement Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">MR Code</p>
              <p className="font-medium">{statement.mrCode}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">{formatDate(statement.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Number of Quotations</p>
              <p className="font-medium">{statement.quotations?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{statement.analysis}</p>
          {statement.selectedSupplierId && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium">Selected Supplier: {statement.selectedSupplierName || 'Supplier ' + statement.selectedSupplierId}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {statement.quotationDetails && statement.quotationDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quotation Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statement.quotationDetails.map((quote: any) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.supplierName}</TableCell>
                    <TableCell>{formatCurrency(quote.total)}</TableCell>
                    <TableCell>{formatDate(quote.expiresAt)}</TableCell>
                    <TableCell>
                      <Badge variant={quote.status === 'Active' ? 'default' : 'secondary'}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
