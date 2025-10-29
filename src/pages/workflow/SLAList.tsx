import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { Plus, Search, Clock, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSLAConfigs } from '@/lib/hooks/useWorkflow';

export default function SLAList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: slas, isLoading } = useSLAConfigs();

  const filteredSLAs = slas?.filter((sla) =>
    sla.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sla.entity.toLowerCase().includes(searchQuery.toLowerCase())
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
          {filteredSLAs && filteredSLAs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>SLA Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSLAs.map((sla) => (
                    <TableRow
                      key={sla.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/workflow/sla/${sla.id}`)}
                    >
                      <TableCell className="font-medium">{sla.module}</TableCell>
                      <TableCell>{sla.entity}</TableCell>
                      <TableCell>{sla.slaHours} hours</TableCell>
                      <TableCell>
                        <Badge variant={sla.active ? 'default' : 'secondary'}>
                          {sla.active ? 'Active' : 'Inactive'}
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
