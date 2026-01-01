import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAccounts, useProfitLoss } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exportToCSV } from '@/lib/utils/export';

export default function ProfitLossReport() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<string>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: plData } = useProfitLoss(
    fromDate && toDate ? { fromDate, toDate } : undefined
  );

  const { incomeAccounts, expenseAccounts, totalIncome, totalExpenses, netProfit } = useMemo(() => {
    if (plData?.data) {
      return plData.data;
    }
    
    const income = accounts.filter((a: any) => a.type === 'Income' || a.type === 'Revenue');
    const expenses = accounts.filter((a: any) => a.type === 'Expense');
    
    const totalInc = income.reduce((sum: number, a: any) => sum + Math.abs(a.balance || 0), 0);
    const totalExp = expenses.reduce((sum: number, a: any) => sum + Math.abs(a.balance || 0), 0);
    
    return {
      incomeAccounts: income,
      expenseAccounts: expenses,
      totalIncome: totalInc,
      totalExpenses: totalExp,
      netProfit: totalInc - totalExp,
    };
  }, [accounts, plData]);

  const handleExport = () => {
    const data: any[] = [
      { Section: 'INCOME', Account: '', Amount: '' },
    ];
    incomeAccounts.forEach((a: any) => {
      data.push({ Section: '', Account: a.name, Amount: Math.abs(a.balance || 0) });
    });
    data.push({ Section: '', Account: 'Total Income', Amount: totalIncome });
    data.push({ Section: '', Account: '', Amount: '' });
    data.push({ Section: 'EXPENSES', Account: '', Amount: '' });
    expenseAccounts.forEach((a: any) => {
      data.push({ Section: '', Account: a.name, Amount: Math.abs(a.balance || 0) });
    });
    data.push({ Section: '', Account: 'Total Expenses', Amount: totalExpenses });
    data.push({ Section: '', Account: '', Amount: '' });
    data.push({ Section: 'NET PROFIT/LOSS', Account: '', Amount: netProfit });
    
    exportToCSV(data, `profit-loss-${fromDate}-to-${toDate}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Profit & Loss Statement</h1>
            <p className="text-muted-foreground">Income and expenses from POSTED vouchers only</p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          This report shows data from <strong>POSTED vouchers only</strong>. 
          Draft and approved vouchers are not included.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input 
                type="date" 
                value={fromDate} 
                onChange={(e) => setFromDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input 
                type="date" 
                value={toDate} 
                onChange={(e) => setToDate(e.target.value)} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Income
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{formatCurrency(totalIncome)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Expenses
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">{formatCurrency(totalExpenses)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={`border-l-4 ${netProfit >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader className="pb-2">
            <CardDescription>Net {netProfit >= 0 ? 'Profit' : 'Loss'}</CardDescription>
            <CardTitle className={`text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(netProfit))}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {isLoading ? (
        <div className="py-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Income */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-700">Income</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No income accounts
                      </TableCell>
                    </TableRow>
                  ) : (
                    incomeAccounts.map((a: any) => (
                      <TableRow key={a.id || a._id}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Math.abs(a.balance || 0))}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-green-50 font-bold">
                    <TableCell>Total Income</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(totalIncome)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card>
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700">Expenses</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No expense accounts
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenseAccounts.map((a: any) => (
                      <TableRow key={a.id || a._id}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Math.abs(a.balance || 0))}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-red-50 font-bold">
                    <TableCell>Total Expenses</TableCell>
                    <TableCell className="text-right text-red-600">{formatCurrency(totalExpenses)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Net Profit/Loss Card */}
      <Card className={netProfit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">
              Net {netProfit >= 0 ? 'Profit' : 'Loss'}
            </span>
            <span className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(netProfit))}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
