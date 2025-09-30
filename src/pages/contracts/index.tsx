import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Users, Receipt, Briefcase } from 'lucide-react';

export default function ContractsIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Work Orders',
      description: 'Manage contractor work orders',
      icon: FileText,
      path: '/contracts/work-orders',
      color: 'text-blue-600',
    },
    {
      title: 'Contractors',
      description: 'Contractor database and details',
      icon: Briefcase,
      path: '/contracts/contractors',
      color: 'text-green-600',
    },
    {
      title: 'RA Bills',
      description: 'Running account bills and payments',
      icon: Receipt,
      path: '/contracts/ra-bills',
      color: 'text-purple-600',
    },
    {
      title: 'Labour Rates',
      description: 'Labour category rates and wages',
      icon: Users,
      path: '/contracts/labour-rates',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contracts Management</h1>
        <p className="text-muted-foreground">Manage contractors and work orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
