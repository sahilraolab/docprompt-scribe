import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Book, BarChart3, Wallet } from 'lucide-react';

export default function Accounts() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Journal Entries',
      description: 'Double-entry accounting journals',
      icon: BookOpen,
      path: '/accounts/journals',
      color: 'text-blue-600',
    },
    {
      title: 'Chart of Accounts',
      description: 'Ledgers and account balances',
      icon: Book,
      path: '/accounts/ledgers',
      color: 'text-green-600',
    },
    {
      title: 'Financial Reports',
      description: 'P&L, Balance Sheet, Cash Flow',
      icon: BarChart3,
      path: '/accounts/reports',
      color: 'text-purple-600',
    },
    {
      title: 'Cost Centers',
      description: 'Project-wise cost tracking',
      icon: Wallet,
      path: '/accounts/list',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accounts & Finance</h1>
        <p className="text-muted-foreground">Financial management and accounting</p>
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
