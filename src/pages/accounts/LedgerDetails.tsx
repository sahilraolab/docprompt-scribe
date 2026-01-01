import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Download, TrendingUp, TrendingDown, Calendar, RefreshCw } from 'lucide-react';
import { useAccount, useLedger } from '@/lib/hooks/useAccounts';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { exportToCSV } from '@/lib/utils/export';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LedgerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Default to current month
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: account, isLoading: isLoadingAccount } = useAccount(id);
  const { data: ledger, isLoading: isLoadingLedger, refetch } = useLedger(
    id || '',
    fromDate && toDate ? { fromDate, toDate } : undefined
  );

  // Calculate totals
  const totals = useMemo(() => {
    if (!ledger?.entries) return { totalDebit: 0, totalCredit: 0 };
    return ledger.entries.reduce(
      (acc, entry) => ({
        totalDebit: acc.totalDebit + (entry.debit || 0),
        totalCredit: acc.totalCredit + (entry.credit || 0),
      }),
      { totalDebit: 0, totalCredit: 0 }
    );
  }, [ledger?.entries]);

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'bg-blue-100 text-blue-800';
      case 'Liability':
        return 'bg-red-100 text-red-800';
      case 'Equity':
        return 'bg-purple-100 text-purple-800';
      case 'Income':
        return 'bg-green-100 text-green-800';
      case 'Expense':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    if (!ledger?.entries || !account) return;
    
    const rows: any[] = [];
    
    // Opening balance row
    rows.push({
      Date: '',
      Particulars: 'Opening Balance',
      'Voucher No': '',
      Debit: '',
      Credit: '',
      Balance: ledger.openingBalance || 0,
    });
    
    // Transaction rows
    ledger.entries.forEach(entry => {
      rows.push({
        Date: entry.date,
        Particulars: entry.particulars,
        'Voucher No': entry.voucherNo,
        Debit: entry.debit || '',
        Credit: entry.credit || '',
        Balance: entry.balance,
      });
    });
    
    // Totals row
    rows.push({
      Date: '',
      Particulars: 'TOTALS',
      'Voucher No': '',
      Debit: totals.totalDebit,
      Credit: totals.totalCredit,
      Balance: '',
    });
    
    // Closing balance row
    rows.push({
      Date: '',
      Particulars: 'Closing Balance',
      'Voucher No': '',
      Debit: '',
      Credit: '',
      Balance: ledger.closingBalance || account.balance,
    });
    
    exportToCSV(rows, `ledger-${account.code}-${fromDate}-to-${toDate}`);
  };

  const setDateRange = (range: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const now = new Date();
    let from = new Date();
    
    switch (range) {
      case 'today':
        from = now;
        break;
      case 'week':
        from.setDate(now.getDate() - 7);
        break;
      case 'month':
        from.setDate(1);
        break;
      case 'quarter':
        from.setMonth(Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        from = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    setFromDate(from.toISOString().split('T')[0]);
    setToDate(now.toISOString().split('T')[0]);
  };

  if (isLoadingAccount) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/ledgers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Account Not Found</h1>
            <p className="text-muted-foreground">The requested account could not be found</p>
          </div>
        </div>
      </div>
    );
  }

  const openingBalance = ledger?.openingBalance || 0;
  const closingBalance = ledger?.closingBalance || account.balance;
  const netChange = closingBalance - openingBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/ledgers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Account Ledger</h1>
            <p className="text-muted-foreground">
              {account.code} - {account.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!ledger?.entries?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Opening Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(openingBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalDebit)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalCredit)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closing Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{formatCurrency(closingBalance)}</p>
              {netChange !== 0 && (
                <Badge variant={netChange > 0 ? 'default' : 'destructive'} className="flex items-center gap-1">
                  {netChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {formatCurrency(Math.abs(netChange))}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Info & Date Filter */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Code</p>
              <p className="font-medium">{account.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{account.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge className={getTypeBadgeColor(account.type)} variant="secondary">
                {account.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={account.active ? 'default' : 'secondary'}>
                {account.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {account.parentName && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Parent Account</p>
                <p className="font-medium">{account.parentName}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setDateRange('today')}>Today</Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange('week')}>Last 7 Days</Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange('month')}>This Month</Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange('quarter')}>This Quarter</Button>
              <Button variant="outline" size="sm" onClick={() => setDateRange('year')}>This Year</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            {ledger?.entries && (
              <Badge variant="secondary">{ledger.entries.length} transactions</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLedger ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : ledger && ledger.entries && ledger.entries.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Particulars</TableHead>
                    <TableHead>Voucher No</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={5}>Opening Balance</TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(openingBalance)}
                    </TableCell>
                  </TableRow>
                  {ledger.entries.map((entry) => (
                    <TableRow key={entry.id} className="hover:bg-muted/30">
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.particulars}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.voucherNo}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(entry.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted font-semibold">
                    <TableCell colSpan={3}>TOTALS</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(totals.totalDebit)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(totals.totalCredit)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10 font-bold border-t-2">
                    <TableCell colSpan={5}>Closing Balance</TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(closingBalance)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No transactions found for this account
                {fromDate && toDate && ' in the selected date range'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting the date filter or check if vouchers have been posted
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
