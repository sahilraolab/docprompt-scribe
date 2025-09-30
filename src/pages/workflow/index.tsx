import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Settings, Clock } from 'lucide-react';

export default function Workflow() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Approvals',
      description: 'Pending approval requests',
      icon: CheckSquare,
      path: '/workflow/approvals',
      color: 'text-blue-600',
    },
    {
      title: 'Workflow Config',
      description: 'Define approval workflows',
      icon: Settings,
      path: '/workflow/config',
      color: 'text-green-600',
    },
    {
      title: 'SLA Management',
      description: 'Service level agreements',
      icon: Clock,
      path: '/workflow/sla',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow & Approvals</h1>
        <p className="text-muted-foreground">Manage approvals and workflow configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <module.icon className={`h-8 w-8 ${module.color}`} />
                <CardTitle className="text-lg">{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
