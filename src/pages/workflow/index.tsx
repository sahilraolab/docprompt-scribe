import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Settings, Clock, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { useApprovals, useWorkflowConfigs, useSLAs } from '@/lib/hooks/useWorkflow';
import { exportToCSV } from '@/lib/utils/export';

export default function Workflow() {
  const navigate = useNavigate();
  const { data: approvals = [], isLoading: loadingApprovals } = useApprovals();
  const { data: workflows = [], isLoading: loadingWorkflows } = useWorkflowConfigs();
  const { data: slas = [], isLoading: loadingSLAs } = useSLAs();

  const pendingApprovals = approvals.filter((a: any) => a.status === 'pending').length;
  const approvedToday = approvals.filter((a: any) => {
    const today = new Date().toDateString();
    return a.status === 'approved' && new Date(a.updatedAt).toDateString() === today;
  }).length;
  const slaBreaches = approvals.filter((a: any) => a.slaStatus === 'breached').length;
  const activeWorkflows = workflows.filter((w: any) => w.status === 'active').length;

  const handleExport = () => {
    const data = [
      { Module: 'Approvals', Total: approvals.length, Pending: pendingApprovals },
      { Module: 'Approved Today', Count: approvedToday },
      { Module: 'SLA Breaches', Count: slaBreaches },
      { Module: 'Active Workflows', Count: activeWorkflows },
    ];
    exportToCSV(data, `workflow-overview-${new Date().toISOString().split('T')[0]}`);
  };

  const modules = [
    {
      title: 'Approvals',
      description: 'Pending approval requests',
      icon: CheckSquare,
      path: '/workflow/approvals',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Workflow Config',
      description: 'Define approval workflows',
      icon: Settings,
      path: '/workflow/config',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'SLA Management',
      description: 'Service level agreements',
      icon: Clock,
      path: '/workflow/sla',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow & Approvals</h1>
          <p className="text-muted-foreground mt-1">Manage approvals and workflow configurations</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={loadingApprovals}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Pending Approvals"
          value={loadingApprovals ? '...' : pendingApprovals.toString()}
          description="Awaiting action"
          icon={Clock}
        />
        <KPICard
          title="Approved Today"
          value={loadingApprovals ? '...' : approvedToday.toString()}
          description="Successfully processed"
          icon={CheckCircle2}
        />
        <KPICard
          title="SLA Breaches"
          value={loadingApprovals ? '...' : slaBreaches.toString()}
          description="Needs attention"
          icon={AlertCircle}
        />
        <KPICard
          title="Active Workflows"
          value={loadingWorkflows ? '...' : activeWorkflows.toString()}
          description="Configured"
          icon={Settings}
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all border-l-4 hover:border-l-primary"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
