import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApprovalRequests } from '@/lib/hooks/useWorkflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { ApprovalActions } from '@/components/ApprovalActions';
import { formatDate } from '@/lib/utils/format';
import { Search, FileCheck, Loader2, Clock, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ApprovalsList() {
  const navigate = useNavigate();
  const { data: approvals, isLoading } = useApprovalRequests();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApprovals = approvals?.filter((a) =>
    a.entityCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.submittedByName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.entityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Approval Requests</h1>
          <p className="text-muted-foreground">Review and approve pending requests</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, submitter, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredApprovals && filteredApprovals.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entity</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell className="font-medium">{approval.entityType}</TableCell>
                      <TableCell>{approval.entityCode}</TableCell>
                      <TableCell>{approval.submittedByName}</TableCell>
                      <TableCell>Level {approval.currentLevel}</TableCell>
                      <TableCell>
                        {approval.dueAt ? formatDate(approval.dueAt) : 'N/A'}
                        {approval.overdue && (
                          <Badge variant="destructive" className="ml-2">
                            <Clock className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={approval.status} />
                      </TableCell>
                      <TableCell>
                        {approval.status === 'Pending' ? (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (approval.entityType === 'PO') {
                                  navigate(`/purchase/pos/${approval.entityId}`);
                                } else if (approval.entityType === 'WO') {
                                  navigate(`/contracts/work-orders/${approval.entityId}`);
                                }
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <ApprovalActions
                              requestId={approval.id}
                              entityType={approval.entityType}
                              entityCode={approval.entityCode || ''}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {approval.status}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileCheck}
              title="No approval requests"
              description={
                searchQuery
                  ? "No approval requests match your search criteria"
                  : "All approval requests are completed"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
