import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEstimates } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function EstimatesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: estimates = [], isLoading } = useEstimates();
  const filteredEstimates = estimates.filter((est: any) =>
    est.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `v${est.version}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Estimates</h1>
          <p className="text-muted-foreground">Manage project cost estimates with version control</p>
        </div>
        <Button onClick={() => navigate('/engineering/estimates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project name or version..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEstimates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEstimates.map((est: any) => (
                    <TableRow
                      key={est._id || est.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/engineering/estimates/${est._id || est.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {est.projectId?.name || est.projectName || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>v{est.version}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(est.totalAmount || est.total || 0)}
                      </TableCell>
                      <TableCell>{est.createdBy?.name || est.createdBy || 'N/A'}</TableCell>
                      <TableCell>{formatDate(est.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={est.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No estimates found"
              description={
                searchQuery
                  ? "No estimates match your search criteria"
                  : "Create project estimates to track costs"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Estimate",
                      onClick: () => navigate('/engineering/estimates/new'),
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
