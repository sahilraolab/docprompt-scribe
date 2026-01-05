import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { useRequisition, useSubmitRequisition } from '@/lib/hooks/usePurchase';
import { toast } from 'sonner';

export default function MRDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: mr, isLoading } = useRequisition(Number(id));
  const submitMR = useSubmitRequisition();

  /* ===================== LOADING ===================== */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!mr) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">MR Not Found</h2>
        <Button onClick={() => navigate('/purchase/mrs')}>
          Back to List
        </Button>
      </div>
    );
  }

  /* ===================== HANDLERS ===================== */

  const handleSubmit = () => {
    submitMR.mutate(mr.id, {
      onSuccess: () => {
        toast.success('MR submitted for approval');
        navigate('/purchase/mrs');
      },
    });
  };

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/purchase/mrs')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-3xl font-bold">
              Material Requisition
            </h1>
            <p className="text-muted-foreground">{mr.reqNo}</p>
          </div>
        </div>

        {mr.status === 'DRAFT' && (
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        )}
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="MR No" value={mr.reqNo} />
          <Info
            label="Status"
            value={
              <Badge
                variant={
                  mr.status === 'APPROVED'
                    ? 'default'
                    : mr.status === 'REJECTED'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {mr.status}
              </Badge>
            }
          />
          <Info label="Project ID" value={mr.projectId} />
          <Info label="Budget ID" value={mr.budgetId} />
          <Info label="Estimate ID" value={mr.estimateId} />
          <Info label="Requested By (User ID)" value={mr.requestedBy} />
          <Info
            label="Created At"
            value={formatDate(mr.createdAt)}
          />
          {mr.submittedAt && (
            <Info
              label="Submitted At"
              value={formatDate(mr.submittedAt)}
            />
          )}
        </CardContent>
      </Card>

      {/* Placeholder for Items */}
      <Card>
        <CardHeader>
          <CardTitle>Requested Items</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Item-level MR lines will appear here once MR items are implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================== INFO COMPONENT ===================== */

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  );
}
