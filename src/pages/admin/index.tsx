import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Activity, UserCheck } from 'lucide-react';
import { KPICard } from '@/components/KPICard';

export default function Admin() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'User Management',
      description: 'Manage users, roles and permissions',
      icon: Users,
      path: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Audit Trail',
      description: 'Track system activities and changes',
      icon: Shield,
      path: '/admin/audit',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Administration</h1>
        <p className="text-muted-foreground mt-1">User management and system monitoring</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Users"
          value="45"
          description="Active system users"
          icon={Users}
        />
        <KPICard
          title="Active Sessions"
          value="12"
          description="Currently logged in"
          icon={UserCheck}
        />
        <KPICard
          title="Admin Users"
          value="3"
          description="System administrators"
          icon={Shield}
        />
        <KPICard
          title="Audit Entries"
          value="1,234"
          description="This month"
          icon={Activity}
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
