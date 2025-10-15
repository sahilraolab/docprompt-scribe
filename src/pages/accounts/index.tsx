import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Book, BarChart3, Wallet, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';

export default function Accounts() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Journal Entries',
      description: 'Double-entry accounting journals',
      icon: BookOpen,
      path: '/accounts/journals',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Chart of Accounts',
      description: 'Ledgers and account balances',
      icon: Book,
      path: '/accounts/ledgers',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Financial Reports',
      description: 'P&L, Balance Sheet, Cash Flow',
      icon: BarChart3,
      path: '/accounts/reports',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Cost Centers',
      description: 'Project-wise cost tracking',
      icon: Wallet,
      path: '/accounts/list',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Accounts & Finance</h1>
        <p className="text-muted-foreground mt-1">Financial management and accounting</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(28500000, 'short')}
          description="This year"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(19200000, 'short')}
          description="This year"
          icon={TrendingDown}
        />
        <KPICard
          title="Net Profit"
          value={formatCurrency(9300000, 'short')}
          description="This year"
          icon={DollarSign}
          trend={{ value: 22, isPositive: true }}
        />
        <KPICard
          title="Pending Entries"
          value="12"
          description="To be posted"
          icon={FileText}
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all border-t-4 hover:border-t-primary"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-4 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-8 w-8 ${module.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
