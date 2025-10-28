import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
import {
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import {
  useMR,
  useApproveMR,
  useRejectMR,
  useSubmitMR,
} from '@/lib/hooks/usePurchaseBackend';
import { toast } from 'sonner';

export default function MRDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading } = useMR(id || '');
  const approveMR = useApproveMR();
  const rejectMR = useRejectMR();
  const submitMR = useSubmitMR();
  const [comments, setComments] = useState('');

  const mr = response?.data || response;

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
        <Button onClick={() => navigate('/purchase/mrs')}>Back to List</Button>
      </div>
    );
  }

  const projectName = mr.projectId?.name || 'N/A';
  const projectCode = mr.projectId?.code || 'N/A';
  const requestedByName = mr.requestedBy?.name || 'N/A';
  const approvals = mr.approvals || [];
  const items = mr.items || [];

  const handleApproval = (status: 'Approved' | 'Rejected') => {
    if (!id) return;
    const action =
      status === 'Approved' ? approveMR.mutate : rejectMR.mutate;

    action(
      { id, data: { comments } },
      {
        onSuccess: () => {
          toast.success(`MR ${status} successfully`);
          setComments('');
        },
      }
    );
  };

  const handleSubmit = () => {
    if (!id) return;
    submitMR.mutate(id, {
      onSuccess: () => {
        toast.success('MR submitted for approval');
      },
    });
  };

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
            <h1 className="text-3xl font-bold">Material Requisition</h1>
            <p className="text-muted-foreground">{mr.code}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {mr.status === 'Draft' && (
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" /> Submit for Approval
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate(`/purchase/mrs/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Info label="MR Code" value={mr.code} />
          <Info
            label="Status"
            value={
              <Badge
                variant={
                  mr.status === 'Approved'
                    ? 'default'
                    : mr.status === 'Rejected'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {mr.status}
              </Badge>
            }
          />
          <Info label="Project" value={`${projectName} (${projectCode})`} />
          <Info label="Requested By" value={requestedByName} />
          <Info label="Remarks" value={mr.remarks || '-'} />
          <Info
            label="Created At"
            value={formatDate(mr.createdAt || new Date())}
          />
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Requested Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead>Required By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>
                    {item.requiredBy ? formatDate(item.requiredBy) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Approver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((a: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{a.userId?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          a.status === 'Approved'
                            ? 'default'
                            : a.status === 'Rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.comments || '-'}</TableCell>
                    <TableCell>
                      {a.timestamp ? formatDate(a.timestamp) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">
              No approvals recorded yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Approver Actions */}
      {mr.status === 'Pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Add your comments before approval/rejection"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={() => handleApproval('Approved')}>
                <CheckCircle className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleApproval('Rejected')}
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  );
}
