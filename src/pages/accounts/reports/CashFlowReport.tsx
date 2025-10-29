import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useJournals } from '@/lib/hooks/useAccounts';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Input } from '@/components/ui/input';

export default function CashFlowReport() {
  const navigate = useNavigate();
  const { data: journals = [], isLoading } = useJournals();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filtered = useMemo(() => {
    if (!fromDate || !toDate) return journals;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return journals.filter((j) => {
      const d = new Date(j.date);
      return d >= from && d <= to;
    });
  }, [journals, fromDate, toDate]);

  const summary = useMemo(() => {
    const receipts = filtered
      .filter((j) => j.type === 'Receipt')
      .reduce((s, j) => s + (j.totalDebit || 0), 0);
    const payments = filtered
      .filter((j) => j.type === 'Payment')
      .reduce((s, j) => s + (j.totalCredit || 0), 0);
    const net = receipts - payments;
    return { receipts, payments, net };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Cash Flow</h1>
          <p className="text-muted-foreground">Cash inflows and outflows (Payments vs Receipts)</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="fromDate">From</label>
            <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="toDate">To</label>
            <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cash Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(summary.receipts)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cash Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(summary.payments)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(summary.net)}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
