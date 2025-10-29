import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, PieChart, BarChart3, Loader2, Download } from 'lucide-react';
import { useFinancialSummary } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';
import { exportToCSV } from '@/lib/utils/export';

export default function ReportsList() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useFinancialSummary();

  const handleExportSummary = () => {
    if (!summary) return;
    const data = [
      { Metric: 'Total Assets', Amount: summary.totalAssets },
      { Metric: 'Total Liabilities', Amount: summary.totalLiabilities },
      { Metric: 'Net Worth', Amount: summary.netWorth },
    ];
    exportToCSV(data, `financial-summary-${new Date().toISOString().split('T')[0]}`);
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">View and generate financial statements</p>
        </div>
        <Button onClick={handleExportSummary} variant="outline" disabled={isLoading || !summary}>
          <Download className="h-4 w-4 mr-2" />
          Export Summary
        </Button>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.totalAssets || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Liabilities</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary?.totalLiabilities || 0)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency((summary?.totalAssets || 0) - (summary?.totalLiabilities || 0))}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
