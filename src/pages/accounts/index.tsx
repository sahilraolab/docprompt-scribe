import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Book, BarChart3, Wallet, TrendingUp, TrendingDown, DollarSign, FileText, Download } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { useAccounts, useJournals } from '@/lib/hooks/useAccounts';
import { exportToCSV } from '@/lib/utils/export';

export default function Accounts() {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: journals = [] } = useAccounts();

  const totalRevenue = accounts
    .filter(a => a.type === 'revenue')
    .reduce((sum, a) => sum + (a.balance || 0), 0);
  
  const totalExpenses = accounts
    .filter(a => a.type === 'expense')
    .reduce((sum, a) => sum + (a.balance || 0), 0);
  
  const netProfit = totalRevenue - totalExpenses;
  const pendingEntries = journals.filter((j: any) => j.status === 'draft').length;

  const handleExport = () => {
    const data = [
      { Metric: 'Total Revenue', Amount: totalRevenue },
      { Metric: 'Total Expenses', Amount: totalExpenses },
      { Metric: 'Net Profit', Amount: netProfit },
      { Metric: 'Total Accounts', Count: accounts.length },
      { Metric: 'Pending Entries', Count: pendingEntries },
    ];
    exportToCSV(data, `accounts-overview-${new Date().toISOString().split('T')[0]}`);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts & Finance</h1>
          <p className="text-muted-foreground mt-1">Financial management and accounting</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={isLoading}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Revenue"
          value={isLoading ? '...' : formatCurrency(totalRevenue, 'short')}
          description="Total revenue"
          icon={TrendingUp}
        />
        <KPICard
          title="Expenses"
          value={isLoading ? '...' : formatCurrency(totalExpenses, 'short')}
          description="Total expenses"
          icon={TrendingDown}
        />
        <KPICard
          title="Net Profit"
          value={isLoading ? '...' : formatCurrency(netProfit, 'short')}
          description="Profit/Loss"
          icon={DollarSign}
        />
        <KPICard
          title="Pending Entries"
          value={isLoading ? '...' : pendingEntries.toString()}
          description="Draft journals"
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
