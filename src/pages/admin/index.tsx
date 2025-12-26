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
      description: 'Create and manage system users with role-based access control',
      icon: Users,
      path: '/admin/users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Roles & Permissions',
      description: 'Define roles and assign granular permissions',
      icon: ShieldCheck,
      path: '/admin/roles',
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
    {
      title: 'System Activity Logs',
      description: 'Monitor all user activities and system events',
      icon: Activity,
      path: '/admin/audit',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, access control, and monitor system activities
        </p>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Card
            key={module.path}
            onClick={() => navigate(module.path)}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 border-l-4 border-l-transparent hover:border-l-primary group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${module.bgColor} transition-transform group-hover:scale-110`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
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
