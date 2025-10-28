import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingCart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useBOQ, useApproveBOQ, useGenerateMRFromBOQ, useMRsByBOQ } from '@/lib/hooks/useMaterialMaster';
import { toast } from 'sonner';

const BOQDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: boq, isLoading } = useBOQ(id!);
  const approveBOQ = useApproveBOQ();
  const generateMR = useGenerateMRFromBOQ();
  const { data: mrs } = useMRsByBOQ(id!);

  const handleApprove = () => {
    if (confirm('Approve this BOQ?')) {
      approveBOQ.mutate(id!, {
        onSuccess: () => toast.success('BOQ approved successfully'),
      });
    }
  };

  const handleGenerateMR = () => {
    if (confirm('Generate Material Requisition from this BOQ?')) {
      if (!boq?.items) return;
      const selectedItems = boq.items.filter(
        (item: any) => (item.balanceQty || item.qty) > 0
      );

      generateMR.mutate(
        {
          boqId: id!,
          data: {
            projectId: boq.projectId,
            items: selectedItems.map((item: any) => ({
              itemId: item.itemId,
              boqItemId: item.id,
              qty: item.balanceQty || item.qty,
              uom: item.uom,
              description: item.description,
              estimatedRate: item.estimatedRate,
            })),
          },
        },
        {
          onSuccess: () => {
            toast.success('MR generated successfully');
            navigate('/purchase/mrs');
          },
        }
      );
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!boq) return <div>BOQ not found</div>;

  // ✅ Safe value helpers
  const safeNumber = (val: any) =>
    typeof val === 'number' && !isNaN(val) ? val : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`BOQ - ${boq.projectName || boq.projectId?.name || 'Unnamed Project'}`}
        description={`Version ${boq.version || 1}`}
      />

      <Button variant="ghost" onClick={() => navigate('/engineering/boq')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to BOQ List
      </Button>

      {/* Summary cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                className="mt-1"
                variant={boq.status === 'Approved' ? 'default' : 'secondary'}
              >
                {boq.status || 'Draft'}
              </Badge>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold mt-1">
                ₹{safeNumber(boq.totalCost).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Items</p>
              <p className="text-2xl font-bold mt-1">{boq.items?.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Items Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">BOQ Items</h3>
          <div className="flex gap-2">
            {boq.status === 'Draft' && (
              <Button onClick={handleApprove} disabled={approveBOQ.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve BOQ
              </Button>
            )}
            {boq.status === 'Approved' && (
              <Button onClick={handleGenerateMR} disabled={generateMR.isPending}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Generate MR
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Consumed</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boq.items?.map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell className="font-mono text-sm">
                    {item.itemId?.code || '-'}
                  </TableCell>
                  <TableCell>{item.itemId?.name || item.description || '-'}</TableCell>
                  <TableCell>{item.itemId?.category || '-'}</TableCell>
                  <TableCell className="text-right">{safeNumber(item.qty)}</TableCell>
                  <TableCell>{item.uom || item.itemId?.uom || '-'}</TableCell>
                  <TableCell className="text-right">
                    ₹{safeNumber(item.rate || item.itemId?.standardRate).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{safeNumber(item.amount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="text-right">0</TableCell>
                  <TableCell className="text-right font-semibold">{safeNumber(item.qty)}</TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </div>

        {/* Total footer */}
        <div className="flex justify-end mt-4 space-y-2">
          <div className="text-right">
            <p className="text-lg font-semibold">
              Total: ₹{safeNumber(boq.totalCost).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </Card>

      {/* Generated MRs */}
      {mrs && mrs.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Generated Material Requisitions
          </h3>
          <div className="space-y-2">
            {mrs.map((mr: any) => (
              <div
                key={mr.id || mr._id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{mr.code}</p>
                  <p className="text-sm text-muted-foreground">
                    {mr.items?.length || 0} items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{mr.status || 'Draft'}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/purchase/mrs/${mr.id || mr._id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default BOQDetails;
