import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMRs } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { downloadCSV, prepareDataForExport } from '@/lib/utils/export-enhanced';
import { Plus, Search, FileText, Loader2, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function MRList() {
  const navigate = useNavigate();
  const { data: mrs, isLoading } = useMRs();
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedMRs = mrs?.map((mr) => ({
  ...mr,
  id: mr._id,
  projectName: mr.projectId?.name || 'N/A',
  requestedByName: mr.requestedBy?.name || 'N/A',
  approvalStatus: mr.approvals?.[0]?.status || mr.status || 'Pending',
}));


  const filteredMRs = normalizedMRs?.filter((mr) =>
    mr.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mr.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mr.requestedByName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (!filteredMRs || filteredMRs.length === 0) return;
    
    const exportData = prepareDataForExport(filteredMRs);
    downloadCSV(
      exportData,
      `material-requisitions-${new Date().toISOString().split('T')[0]}`,
      ['code', 'projectName', 'requestedByName', 'requestDate', 'status']
    );
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
          <h1 className="text-3xl font-bold">Material Requisitions</h1>
          <p className="text-muted-foreground">Manage material requests from projects</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={!filteredMRs || filteredMRs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/purchase/mrs/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New MR
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by MR code, project, or requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredMRs && filteredMRs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MR Code</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMRs.map((mr) => (
                    <TableRow
                      key={mr.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/purchase/mrs/${mr.id}/view`)}
                    >
                      <TableCell className="font-medium">{mr.code}</TableCell>
                      <TableCell>{mr.projectName}</TableCell>
                      <TableCell>{mr.items.length} items</TableCell>
                      <TableCell>{mr.requestedByName}</TableCell>
                      <TableCell>{formatDate(mr.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={mr.status} />
                      </TableCell>
                      <TableCell>
                        {mr.approvalStatus && (
                          <StatusBadge status={mr.approvalStatus} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No material requisitions found"
              description={
                searchQuery
                  ? "No MRs match your search criteria"
                  : "Create material requisitions for project needs"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create MR",
                      onClick: () => navigate('/purchase/mrs/new'),
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
