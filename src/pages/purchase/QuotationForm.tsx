import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useProjects } from '@/lib/hooks/useProjects';
import { useRFQs, useCreateQuotation } from '@/lib/hooks/usePurchase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Input } from '@/components/ui/input';

import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

/* =====================================================
   COMPONENT
===================================================== */

export default function QuotationCreate() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const presetRfqId = params.get('rfqId');

  /* ================= PROJECT ================= */

  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const [projectId, setProjectId] = useState<number | null>(null);

  /* ================= RFQs ================= */

  const { data: rfqs = [], isLoading: loadingRFQs } = useRFQs(
    presetRfqId ? { requisitionId: undefined } : undefined,
    { enabled: false }
  );

  const rfqOptions = useMemo(
    () =>
      rfqs
        .filter((r: any) => r.status === 'OPEN')
        .map((r: any) => ({
          value: String(r.id),
          label: r.rfqNo,
        })),
    [rfqs]
  );

  const [rfqId, setRfqId] = useState<number | null>(
    presetRfqId ? Number(presetRfqId) : null
  );

  /* ================= FORM ================= */

  const createQuotation = useCreateQuotation();

  const [supplierId, setSupplierId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const isLoading = loadingProjects || loadingRFQs || createQuotation.isPending;

  /* ================= SUBMIT ================= */

  const submit = () => {
    if (!projectId || !rfqId || !supplierId || !totalAmount) {
      toast.error('All fields are required');
      return;
    }

    createQuotation.mutate(
      {
        rfqId,
        projectId,
        supplierId: Number(supplierId),
        totalAmount: Number(totalAmount),
      },
      {
        onSuccess: () => {
          toast.success('Quotation submitted');
          navigate('/purchase/quotations');
        },
      }
    );
  };

  /* ================= UI ================= */

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Submit Quotation</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <SearchableSelect
            options={projects.map((p: any) => ({
              value: String(p.id),
              label: p.name,
            }))}
            value={projectId ? String(projectId) : undefined}
            onChange={(v) => setProjectId(Number(v))}
            placeholder="Select Project"
          />

          <SearchableSelect
            options={rfqOptions}
            value={rfqId ? String(rfqId) : undefined}
            onChange={(v) => setRfqId(Number(v))}
            placeholder="Select RFQ"
            disabled={!!presetRfqId}
          />

          <Input
            placeholder="Supplier ID"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Total Amount"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />

          <Button onClick={submit}>Submit Quotation</Button>
        </CardContent>
      </Card>
    </div>
  );
}
