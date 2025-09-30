import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { Plus, Search, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function SLAList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const slas = [
    {
      id: '1',
      name: 'MR Approval Response Time',
      module: 'Purchase',
      targetHours: 24,
      breachCount: 2,
      complianceRate: 92,
      priority: 'High',
    },
    {
      id: '2',
      name: 'PO Processing Time',
      module: 'Purchase',
      targetHours: 48,
      breachCount: 1,
      complianceRate: 96,
      priority: 'High',
    },
    {
      id: '3',
      name: 'Work Order Approval',
      module: 'Contracts',
      targetHours: 72,
      breachCount: 0,
      complianceRate: 100,
      priority: 'Medium',
    },
    {
      id: '4',
      name: 'RA Bill Processing',
      module: 'Contracts',
      targetHours: 120,
      breachCount: 3,
      complianceRate: 88,
      priority: 'Medium',
    },
    {
      id: '5',
      name: 'Journal Entry Approval',
      module: 'Accounts',
      targetHours: 24,
      breachCount: 5,
      complianceRate: 85,
      priority: 'High',
    },
  ];

  const filteredSLAs = slas.filter((sla) =>
    sla.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sla.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SLA Management</h1>
          <p className="text-muted-foreground">Service level agreements and tracking</p>
        </div>
        <Button onClick={() => navigate('/workflow/sla/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New SLA
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by SLA name or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredSLAs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SLA Name</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Target Time</TableHead>
                    <TableHead>Breaches</TableHead>
                    <TableHead>Compliance Rate</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSLAs.map((sla) => (
                    <TableRow
                      key={sla.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/workflow/sla/${sla.id}`)}
                    >
                      <TableCell className="font-medium">{sla.name}</TableCell>
                      <TableCell>{sla.module}</TableCell>
                      <TableCell>{sla.targetHours} hours</TableCell>
                      <TableCell>
                        {sla.breachCount > 0 ? (
                          <span className="text-red-600 font-medium">{sla.breachCount}</span>
                        ) : (
                          <span className="text-green-600 font-medium">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getComplianceColor(sla.complianceRate)}`}>
                          {sla.complianceRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadgeColor(sla.priority)} variant="secondary">
                          {sla.priority}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No SLAs found"
              description={
                searchQuery
                  ? "No SLAs match your search criteria"
                  : "Define service level agreements for process monitoring"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create SLA",
                      onClick: () => navigate('/workflow/sla/new'),
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
