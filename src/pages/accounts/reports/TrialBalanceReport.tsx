import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TrialBalanceReport() {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading } = useAccounts();

  const rows = useMemo(() => {
    const debitTypes = new Set(['Asset', 'Expense']);
    return accounts.map((a) => {
      const isDebitType = debitTypes.has(a.type);
      const amount = Math.abs(a.balance || 0);
      return {
        id: a.id,
        code: a.code,
        name: a.name,
        debit: isDebitType ? amount : 0,
        credit: !isDebitType ? amount : 0,
      };
    });
  }, [accounts]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.debit += r.debit;
        acc.credit += r.credit;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Trial Balance</h1>
          <p className="text-muted-foreground">Debit and credit balances summary</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{r.code}</TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right">{r.debit > 0 ? formatCurrency(r.debit) : '-'}</TableCell>
                      <TableCell className="text-right">{r.credit > 0 ? formatCurrency(r.credit) : '-'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>Totals</TableCell>
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
