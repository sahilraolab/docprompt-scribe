import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useAccounts, useTrialBalance } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exportToCSV } from '@/lib/utils/export';

export default function TrialBalanceReport() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: trialBalanceData } = useTrialBalance(
    fromDate && toDate ? { fromDate, toDate } : undefined
  );

  // Use API data if available, otherwise calculate from accounts
  const rows = useMemo(() => {
    if (trialBalanceData?.data) {
      return trialBalanceData.data;
    }
    
    const debitTypes = new Set(['Asset', 'Expense']);
    return accounts.map((a: any) => {
      const isDebitType = debitTypes.has(a.type);
      const amount = Math.abs(a.balance || 0);
      return {
        id: a.id || a._id,
        code: a.code,
        name: a.name,
        type: a.type,
        debit: isDebitType ? amount : 0,
        credit: !isDebitType ? amount : 0,
      };
    });
  }, [accounts, trialBalanceData]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc: { debit: number; credit: number }, r: any) => {
        acc.debit += r.debit || 0;
        acc.credit += r.credit || 0;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [rows]);

  const isBalanced = Math.abs(totals.debit - totals.credit) < 0.01;

  const handleExport = () => {
    const data = rows.map((r: any) => ({
      Code: r.code,
      Account: r.name,
      Type: r.type,
      Debit: r.debit || 0,
      Credit: r.credit || 0,
    }));
    data.push({
      Code: '',
      Account: 'TOTAL',
      Type: '',
      Debit: totals.debit,
      Credit: totals.credit,
    });
    exportToCSV(data, `trial-balance-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Trial Balance</h1>
            <p className="text-muted-foreground">Debit and credit balances from POSTED vouchers only</p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          This report shows balances from <strong>POSTED vouchers only</strong>. 
          Draft and approved vouchers are not included until they are posted to the ledger.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Date Range (Optional)</CardTitle>
          <CardDescription>Leave empty for all-time balances</CardDescription>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Summary</CardTitle>
            {!isBalanced && (
              <span className="text-sm text-destructive font-medium">
                ⚠️ Trial Balance is not balanced!
              </span>
            )}
            {isBalanced && rows.length > 0 && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Balanced
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No posted transactions found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.type}</TableCell>
                      <TableCell className="text-right">{r.debit > 0 ? formatCurrency(r.debit) : '-'}</TableCell>
                      <TableCell className="text-right">{r.credit > 0 ? formatCurrency(r.credit) : '-'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className={`font-bold ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
                    <TableCell colSpan={3}>TOTAL</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.debit)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totals.credit)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}