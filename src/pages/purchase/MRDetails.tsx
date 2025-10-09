import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/LoadingSpinner';

async function fetchMR(id: string) {
  const response = await fetch(`/api/mrs/${id}`);
  if (!response.ok) throw new Error('Failed to fetch MR');
  return response.json();
}

export default function MRDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: mr, isLoading } = useQuery({
    queryKey: ['mrs', id],
    queryFn: () => fetchMR(id!),
    enabled: !!id,
  });

  if (isLoading) return <LoadingSpinner />;
  if (!mr) return <div>MR not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/mrs')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">MR Details</h1>
            <p className="text-muted-foreground">{mr.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/purchase/mrs/${id}/edit`)}>
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
                <p className="text-sm text-muted-foreground">MR Code</p>
                <p className="font-medium">{mr.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={mr.status === 'Approved' ? 'default' : 'secondary'}>
                  {mr.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{mr.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requested By</p>
                <p className="font-medium">{mr.requestedByName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">{formatDate(mr.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {mr.approvals && mr.approvals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Approval Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mr.approvals.map((approval: any) => (
                  <div key={approval.userId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{approval.userName}</p>
                      <p className="text-sm text-muted-foreground">{approval.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {approval.status === 'Approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : approval.status === 'Rejected' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
                <TableHead>Item Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead>Required By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mr.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.itemName || '-'}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>{item.requiredBy ? formatDate(item.requiredBy) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
