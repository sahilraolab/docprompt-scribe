import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

export default function ReportsList() {
  const navigate = useNavigate();

  const reports = [
    {
      title: 'Trial Balance',
      description: 'Debit and credit balances summary',
      icon: BarChart3,
      path: '/accounts/reports/trial-balance',
      color: 'text-blue-600',
    },
    {
      title: 'Profit & Loss',
      description: 'Income and expense statement',
      icon: TrendingUp,
      path: '/accounts/reports/profit-loss',
      color: 'text-green-600',
    },
    {
      title: 'Balance Sheet',
      description: 'Assets, liabilities, and equity',
      icon: PieChart,
      path: '/accounts/reports/balance-sheet',
      color: 'text-purple-600',
    },
    {
      title: 'Cash Flow',
      description: 'Cash inflows and outflows',
      icon: FileText,
      path: '/accounts/reports/cash-flow',
      color: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <p className="text-muted-foreground">View and generate financial statements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report) => (
          <Card
            key={report.path}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(report.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <report.icon className={`h-8 w-8 ${report.color}`} />
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{report.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold">₹48.5 L</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Liabilities</p>
              <p className="text-2xl font-bold">₹21.5 L</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Net Worth</p>
              <p className="text-2xl font-bold text-green-600">₹27.0 L</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
