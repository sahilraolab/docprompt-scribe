import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, ClipboardCheck } from 'lucide-react';
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

  // Mock data
  const qcInspections = [
    {
      id: '1',
      inspectionNo: 'QC-2024-001',
      projectName: 'Green Valley Apartments',
      itemName: 'Cement - OPC 53 Grade',
      batchNo: 'BATCH-001',
      quantity: 100,
      unit: 'Bags',
      inspectionDate: '2024-01-15',
      inspectedBy: 'Quality Engineer',
      result: 'Pass',
      remarks: 'All parameters within acceptable limits',
    },
    {
      id: '2',
      inspectionNo: 'QC-2024-002',
      projectName: 'City Mall Extension',
      itemName: 'Steel Bars - 12mm',
      batchNo: 'BATCH-002',
      quantity: 500,
      unit: 'Pcs',
      inspectionDate: '2024-01-18',
      inspectedBy: 'Quality Engineer',
      result: 'Fail',
      remarks: 'Rust found on 5% of bars, rejected',
    },
    {
      id: '3',
      inspectionNo: 'QC-2024-003',
      projectName: 'Smart Office Tower',
      itemName: 'Ready Mix Concrete - M25',
      batchNo: 'BATCH-003',
      quantity: 50,
      unit: 'CUM',
      inspectionDate: '2024-01-20',
      inspectedBy: 'Quality Engineer',
      result: 'Pass',
      remarks: 'Slump test passed, cube samples sent to lab',
    },
    {
      id: '4',
      inspectionNo: 'QC-2024-004',
      projectName: 'Green Valley Apartments',
      itemName: 'Tiles - Vitrified 600x600',
      batchNo: 'BATCH-004',
      quantity: 200,
      unit: 'SQM',
      inspectionDate: '2024-01-22',
      inspectedBy: 'Site Engineer',
      result: 'Hold',
      remarks: 'Awaiting lab test results',
    },
  ];

  const filteredInspections = qcInspections.filter((qc) =>
    qc.inspectionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qc.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qc.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qc.batchNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  {filteredInspections.map((qc) => (
                    <TableRow
                      key={qc.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/qc/${qc.id}`)}
                    >
                      <TableCell className="font-medium">{qc.inspectionNo}</TableCell>
                      <TableCell>{qc.projectName}</TableCell>
                      <TableCell>{qc.itemName}</TableCell>
                      <TableCell className="font-mono text-sm">{qc.batchNo}</TableCell>
                      <TableCell>
                        {qc.quantity} {qc.unit}
                      </TableCell>
                      <TableCell>{qc.inspectedBy}</TableCell>
                      <TableCell>{formatDate(qc.inspectionDate)}</TableCell>
                      <TableCell>
                        <Badge className={getResultBadgeColor(qc.result)} variant="secondary">
                          {qc.result}
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
