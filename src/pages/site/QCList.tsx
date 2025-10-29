import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQCs } from '@/lib/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, ClipboardCheck, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function QCList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: qcInspections = [], isLoading } = useQCs();

  const filteredInspections = qcInspections.filter((qc: any) => {
    const query = searchQuery.toLowerCase();
    return (
      qc.inspectionNo?.toLowerCase().includes(query) ||
      qc.projectId?.name?.toLowerCase().includes(query) ||
      qc.itemId?.name?.toLowerCase().includes(query) ||
      qc.batchNo?.toLowerCase().includes(query)
    );
  });

  const getResultBadgeColor = (result: string) => {
    switch (result) {
      case 'Pass':
        return 'bg-green-100 text-green-800';
      case 'Fail':
        return 'bg-red-100 text-red-800';
      case 'Hold':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Control Inspections</h1>
          <p className="text-muted-foreground">Manage material quality checks</p>
        </div>
        <Button onClick={() => navigate('/site/qc/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Inspection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by inspection no, project, item, or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredInspections.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inspection No</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Batch No</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Inspected By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInspections.map((qc: any) => (
                    <TableRow
                      key={qc._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/qc/${qc._id}`)}
                    >
                      <TableCell className="font-medium">{qc.inspectionNo}</TableCell>
                      <TableCell>{qc.projectId?.name || 'N/A'}</TableCell>
                      <TableCell>{qc.itemId?.name || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-sm">{qc.batchNo}</TableCell>
                      <TableCell>
                        {qc.quantity} {qc.unit}
                      </TableCell>
                      <TableCell>{qc.inspectedBy}</TableCell>
                      <TableCell>{formatDate(qc.inspectionDate)}</TableCell>
                      <TableCell>
                        <Badge className={getResultBadgeColor(qc.result || 'Pending')} variant="secondary">
                          {qc.result || 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={ClipboardCheck}
              title="No QC inspections found"
              description={
                searchQuery
                  ? "No inspections match your search criteria"
                  : "Record quality control inspections for materials"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Inspection",
                      onClick: () => navigate('/site/qc/new'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
