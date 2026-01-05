// src/pages/supplier/SupplierQuotationForm.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSubmitSupplierQuotation } from '@/lib/hooks/useSupplier';
import { apiClient } from '@/lib/api/client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

/* ============================
   TYPES
============================ */

interface RFQContext {
  id: number;
  rfqNo: string;
  project: { id: number; name: string };
  requisition: { id: number; reqNo: string };
}

/* ============================
   COMPONENT
============================ */

export default function SupplierQuotationForm() {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const submitQuotation = useSubmitSupplierQuotation();

  const [loading, setLoading] = useState(true);
  const [rfq, setRfq] = useState<RFQContext | null>(null);
  const [validTill, setValidTill] = useState('');
  const [items, setItems] = useState<any[]>([
    { materialId: '', qty: 1, rate: 0, taxPercent: 18 }
  ]);

  /* ============================
     LOAD RFQ CONTEXT
  ============================ */

  useEffect(() => {
    const loadRFQ = async () => {
      try {
        const data = await apiClient.request('/supplier/rfqs', { method: 'GET' });
        const match = data.find((r: any) => r.id === Number(rfqId));

        if (!match) {
          toast.error('RFQ not found');
          navigate('/supplier/rfqs');
          return;
        }

        setRfq(match);
      } catch {
        toast.error('Failed to load RFQ');
      } finally {
        setLoading(false);
      }
    };

    loadRFQ();
  }, [rfqId, navigate]);

  /* ============================
     HANDLERS
  ============================ */

  const addItem = () => {
    setItems([...items, { materialId: '', qty: 1, rate: 0, taxPercent: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = () => {
    if (!rfqId) return;

    if (!items.length) {
      toast.error('At least one item is required');
      return;
    }

    submitQuotation.mutate(
      {
        rfqId: Number(rfqId),
        validTill,
        items
      },
      {
        onSuccess: () => {
          toast.success('Quotation submitted successfully');
          navigate('/supplier/quotations');
        },
        onError: (err: any) => {
          toast.error(err.message || 'Submission failed');
        }
      }
    );
  };

  /* ============================
     RENDER
  ============================ */

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rfq) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Quotation</h1>
        <p className="text-muted-foreground">
          RFQ {rfq.rfqNo} • {rfq.project.name}
        </p>
      </div>

      {/* RFQ INFO */}
      <Card>
        <CardHeader>
          <CardTitle>RFQ Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <Label>RFQ No</Label>
            <div className="font-medium">{rfq.rfqNo}</div>
          </div>
          <div>
            <Label>Requisition</Label>
            <div className="font-medium">{rfq.requisition.reqNo}</div>
          </div>
          <div>
            <Label>Project</Label>
            <div className="font-medium">{rfq.project.name}</div>
          </div>
          <div>
            <Label>Valid Till</Label>
            <Input type="date" value={validTill} onChange={e => setValidTill(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* QUOTATION ITEMS */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Quotation Items</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material ID</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Input
                      value={item.materialId}
                      onChange={e => updateItem(idx, 'materialId', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={e => updateItem(idx, 'rate', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.taxPercent}
                      onChange={e => updateItem(idx, 'taxPercent', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/supplier/rfqs')}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitQuotation.isPending}>
          {submitQuotation.isPending ? 'Submitting…' : 'Submit Quotation'}
        </Button>
      </div>
    </div>
  );
}
