import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, ShieldCheck, Activity } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'User Management',
      description: 'Create and manage system users',
      icon: Users,
      path: '/admin/users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Roles & Permissions',
      description: 'Control access and system privileges',
      icon: ShieldCheck,
      path: '/admin/roles',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'System Activity Logs',
      description: 'View system actions and user activities',
      icon: Activity,
      path: '/admin/audit',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, access control, and system activities
        </p>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            onClick={() => navigate(module.path)}
            className="cursor-pointer transition-all hover:shadow-md border-l-4 hover:border-l-primary"
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {module.title}
                  </CardTitle>
                  <CardDescription>
                    {module.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
