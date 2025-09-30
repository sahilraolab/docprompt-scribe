import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Mock data
  const estimates = [
    {
      id: '1',
      projectName: 'Green Valley Apartments',
      version: 'v2.0',
      totalCost: 15000000,
      status: 'Approved' as const,
      createdAt: '2024-01-15',
      createdBy: 'John Doe',
      isLatest: true,
    },
    {
      id: '2',
      projectName: 'Green Valley Apartments',
      version: 'v1.0',
      totalCost: 14500000,
      status: 'Closed' as const,
      createdAt: '2024-01-10',
      createdBy: 'John Doe',
      isLatest: false,
    },
    {
      id: '3',
      projectName: 'City Mall Extension',
      version: 'v1.0',
      totalCost: 25000000,
      status: 'Draft' as const,
      createdAt: '2024-01-20',
      createdBy: 'Jane Smith',
      isLatest: true,
    },
  ];

  const filteredEstimates = estimates.filter((est) =>
    est.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.version.toLowerCase().includes(searchQuery.toLowerCase())
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
          {filteredEstimates.length > 0 ? (
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
                  {filteredEstimates.map((est) => (
                    <TableRow
                      key={est.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/engineering/estimates/${est.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {est.projectName}
                          {est.isLatest && (
                            <Badge variant="secondary" className="text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{est.version}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(est.totalCost)}
                      </TableCell>
                      <TableCell>{est.createdBy}</TableCell>
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
