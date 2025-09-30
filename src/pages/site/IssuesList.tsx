import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, Send } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function IssuesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const issues = [
    {
      id: '1',
      issueNo: 'ISS-2024-001',
      projectName: 'Green Valley Apartments',
      issuedTo: 'Site Supervisor - Block A',
      itemsCount: 4,
      issueDate: '2024-01-15',
      status: 'Sent' as const,
      issuedBy: 'Store Manager',
    },
    {
      id: '2',
      issueNo: 'ISS-2024-002',
      projectName: 'City Mall Extension',
      issuedTo: 'Contractor Team',
      itemsCount: 6,
      issueDate: '2024-01-18',
      status: 'Pending' as const,
      issuedBy: 'Store Manager',
    },
    {
      id: '3',
      issueNo: 'ISS-2024-003',
      projectName: 'Smart Office Tower',
      issuedTo: 'Electrical Team',
      itemsCount: 3,
      issueDate: '2024-01-20',
      status: 'Sent' as const,
      issuedBy: 'Store Manager',
    },
  ];

  const filteredIssues = issues.filter((issue) =>
    issue.issueNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.issuedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Issues</h1>
          <p className="text-muted-foreground">Track material issued from store to sites</p>
        </div>
        <Button onClick={() => navigate('/site/issues/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Issue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by issue no, project, or recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredIssues.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue No</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Issued To</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Issued By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => (
                    <TableRow
                      key={issue.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/issues/${issue.id}`)}
                    >
                      <TableCell className="font-medium">{issue.issueNo}</TableCell>
                      <TableCell>{issue.projectName}</TableCell>
                      <TableCell>{issue.issuedTo}</TableCell>
                      <TableCell>{issue.itemsCount} items</TableCell>
                      <TableCell>{issue.issuedBy}</TableCell>
                      <TableCell>{formatDate(issue.issueDate)}</TableCell>
                      <TableCell>
                        <StatusBadge status={issue.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title="No issues found"
              description={
                searchQuery
                  ? "No issues match your search criteria"
                  : "Issue materials from store to project sites"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Issue",
                      onClick: () => navigate('/site/issues/new'),
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
