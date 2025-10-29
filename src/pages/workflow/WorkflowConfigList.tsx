import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { Plus, Search, Settings, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useWorkflowConfigs, useToggleWorkflowConfig } from '@/lib/hooks/useWorkflow';

export default function WorkflowConfigList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: workflows, isLoading } = useWorkflowConfigs();
  const toggleWorkflow = useToggleWorkflowConfig();

  const filteredWorkflows = workflows?.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.module.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getModuleBadgeColor = (module: string) => {
    switch (module) {
      case 'Purchase':
        return 'bg-blue-100 text-blue-800';
      case 'Contracts':
        return 'bg-green-100 text-green-800';
      case 'Accounts':
        return 'bg-purple-100 text-purple-800';
      case 'Site':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggle = async (id: string, currentValue: boolean) => {
    await toggleWorkflow.mutateAsync({ id, active: !currentValue });
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
          <h1 className="text-3xl font-bold">Workflow Configuration</h1>
          <p className="text-muted-foreground">Define approval workflows and rules</p>
        </div>
        <Button onClick={() => navigate('/workflow/config/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by workflow name or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredWorkflows && filteredWorkflows.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Workflow Name</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Approval Levels</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkflows.map((workflow) => (
                    <TableRow key={workflow.id}>
                      <TableCell className="font-medium">{workflow.name}</TableCell>
                      <TableCell>
                        <Badge className={getModuleBadgeColor(workflow.module)} variant="secondary">
                          {workflow.module}
                        </Badge>
                      </TableCell>
                      <TableCell>{workflow.entity}</TableCell>
                      <TableCell>{workflow.levels?.length || 0} levels</TableCell>
                      <TableCell>
                        <Switch 
                          checked={workflow.active} 
                          onCheckedChange={() => handleToggle(workflow.id, workflow.active)}
                          disabled={toggleWorkflow.isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/workflow/config/${workflow.id}`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Settings}
              title="No workflows found"
              description={
                searchQuery
                  ? "No workflows match your search criteria"
                  : "Configure approval workflows for your modules"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
