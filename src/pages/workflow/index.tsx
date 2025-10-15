import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Settings, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { KPICard } from '@/components/KPICard';

export default function Workflow() {
  const navigate = useNavigate();

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
      <div>
        <h1 className="text-3xl font-bold">Workflow & Approvals</h1>
        <p className="text-muted-foreground mt-1">Manage approvals and workflow configurations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Pending Approvals"
          value="20"
          description="Awaiting action"
          icon={Clock}
        />
        <KPICard
          title="Approved Today"
          value="15"
          description="Successfully processed"
          icon={CheckCircle2}
        />
        <KPICard
          title="SLA Breaches"
          value="3"
          description="This week"
          icon={AlertCircle}
        />
        <KPICard
          title="Active Workflows"
          value="12"
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
