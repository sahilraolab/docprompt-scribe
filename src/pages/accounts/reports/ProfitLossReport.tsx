import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';

export default function ProfitLossReport() {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading } = useAccounts();

  const income = useMemo(() => accounts.filter((a) => a.type === 'Income'), [accounts]);
  const expenses = useMemo(() => accounts.filter((a) => a.type === 'Expense'), [accounts]);

  const totals = useMemo(() => {
    const incomeTotal = income.reduce((s, a) => s + Math.abs(a.balance || 0), 0);
    const expenseTotal = expenses.reduce((s, a) => s + Math.abs(a.balance || 0), 0);
    return { incomeTotal, expenseTotal, net: incomeTotal - expenseTotal };
  }, [income, expenses]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Profit & Loss</h1>
          <p className="text-muted-foreground">Income and expense statement</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(totals.incomeTotal)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(totals.expenseTotal)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(totals.net)}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
