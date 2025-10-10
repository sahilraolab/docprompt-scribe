import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMRs, useQuotationsByMR, useCreateComparativeStatement } from '@/lib/hooks/usePurchase';

const csSchema = z.object({
  mrId: z.string().min(1, 'Material requisition is required'),
  selectedSupplierId: z.string().optional(),
  analysis: z.string().min(1, 'Analysis is required'),
});

type CSFormData = z.infer<typeof csSchema>;

export default function ComparativeStatementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CSFormData>({
    resolver: zodResolver(csSchema),
  });

  const mrId = watch('mrId');

// Load MRs and quotations dynamically
const { data: mrs } = useMRs();
const { data: quotations = [], isLoading } = useQuotationsByMR(mrId || '');
const createCS = useCreateComparativeStatement();
const [selectedQuotationId, setSelectedQuotationId] = useState<string>('');

  const onSubmit = (data: CSFormData) => {
    if (!selectedSupplier) {
      toast({
        title: 'Error',
        description: 'Please select a supplier before submitting.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      ...data,
      selectedSupplierId: selectedSupplier,
    } as any;

    createCS.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Comparative Statement Created', description: 'Created successfully.' });
        navigate('/purchase/comparative');
      },
      onError: (err: any) => {
        toast({ title: 'Failed to create', description: err?.message || 'Try again', variant: 'destructive' });
      },
    });
  };

// MRs loaded from API via useMRs()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/comparative')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Comparative Statement</h1>
          <p className="text-muted-foreground">Compare quotations and select supplier</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Material Requisition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="mrId">Select MR *</Label>
              <Select
                value={mrId}
                onValueChange={(value) => setValue('mrId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material requisition" />
                </SelectTrigger>
                <SelectContent>
                  {mrs?.map((mr: any) => (
                    <SelectItem key={mr.id} value={mr.id}>
                      {(mr.code || mr.mrCode) ?? mr.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mrId && (
                <p className="text-sm text-destructive">{errors.mrId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quotation Comparison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    {quotations.map((quote) => (
                      <TableHead key={quote.id} className="text-right">
                        {quote.supplierName}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations[0].items.map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>{quotations[0].items[index].description}</TableCell>
                      <TableCell className="text-right">
                        {quotations[0].items[index].qty} {quotations[0].items[index].uom}
                      </TableCell>
                      {quotations.map((quote) => (
                        <TableCell key={quote.id} className="text-right">
                          {formatCurrency(quote.items[index].rate, 'full')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold bg-muted">
                    <TableCell colSpan={2}>Subtotal</TableCell>
                    {quotations.map((quote) => (
                      <TableCell key={quote.id} className="text-right">
                        {formatCurrency(quote.subtotal)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>Tax</TableCell>
                    {quotations.map((quote) => (
                      <TableCell key={quote.id} className="text-right">
                        {formatCurrency(quote.tax)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell colSpan={2}>Total Amount</TableCell>
                    {quotations.map((quote) => (
                      <TableCell key={quote.id} className="text-right">
                        {formatCurrency(quote.total)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {quotations.map((quote) => (
                <Card
                  key={quote.id}
                  className={`cursor-pointer transition-all ${
                    selectedSupplier === quote.supplierId
                      ? 'border-primary border-2 bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSupplier(quote.supplierId)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{quote.supplierName}</CardTitle>
                      {selectedSupplier === quote.supplierId && (
                        <Badge variant="default">
                          <Check className="h-3 w-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold">{formatCurrency(quote.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery:</span>
                      <span>{quote.deliveryDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment:</span>
                      <span>{quote.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valid Until:</span>
                      <span>{quote.validUntil}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis & Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="analysis">Analysis *</Label>
              <Textarea
                {...register('analysis')}
                placeholder="Provide detailed analysis comparing the quotations, considering price, delivery time, payment terms, and supplier reliability. Include your recommendation."
                rows={6}
              />
              {errors.analysis && (
                <p className="text-sm text-destructive">{errors.analysis.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchase/comparative')}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedSupplier}>
            {id ? 'Update' : 'Create'} Statement
          </Button>
        </div>
      </form>
    </div>
  );
}
