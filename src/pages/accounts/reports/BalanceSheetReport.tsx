import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useAccounts, useBalanceSheet } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exportToCSV } from '@/lib/utils/export';

export default function BalanceSheetReport() {
  const navigate = useNavigate();
  const [asOfDate, setAsOfDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const { data: accounts = [], isLoading } = useAccounts();
  const { data: bsData } = useBalanceSheet(asOfDate ? { asOfDate } : undefined);

  const { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity, isBalanced } = useMemo(() => {
    if (bsData?.data) {
      return bsData.data;
    }
    
    const assetAccounts = accounts.filter((a: any) => a.type === 'Asset');
    const liabilityAccounts = accounts.filter((a: any) => a.type === 'Liability');
    const equityAccounts = accounts.filter((a: any) => a.type === 'Equity' || a.type === 'Capital');
    
    const totalA = assetAccounts.reduce((sum: number, a: any) => sum + Math.abs(a.balance || 0), 0);
    const totalL = liabilityAccounts.reduce((sum: number, a: any) => sum + Math.abs(a.balance || 0), 0);
    const totalE = equityAccounts.reduce((sum: number, a: any) => sum + Math.abs(a.balance || 0), 0);
    
    return {
      assets: assetAccounts,
      liabilities: liabilityAccounts,
      equity: equityAccounts,
      totalAssets: totalA,
      totalLiabilities: totalL,
      totalEquity: totalE,
      isBalanced: Math.abs(totalA - (totalL + totalE)) < 0.01,
    };
  }, [accounts, bsData]);

  const handleExport = () => {
    const data: any[] = [];
    data.push({ Section: 'ASSETS', Account: '', Amount: '' });
    assets.forEach((a: any) => {
      data.push({ Section: '', Account: a.name, Amount: Math.abs(a.balance || 0) });
    });
    data.push({ Section: '', Account: 'Total Assets', Amount: totalAssets });
    data.push({ Section: '', Account: '', Amount: '' });
    data.push({ Section: 'LIABILITIES', Account: '', Amount: '' });
    liabilities.forEach((a: any) => {
      data.push({ Section: '', Account: a.name, Amount: Math.abs(a.balance || 0) });
    });
    data.push({ Section: '', Account: 'Total Liabilities', Amount: totalLiabilities });
    data.push({ Section: '', Account: '', Amount: '' });
    data.push({ Section: 'EQUITY', Account: '', Amount: '' });
    equity.forEach((a: any) => {
      data.push({ Section: '', Account: a.name, Amount: Math.abs(a.balance || 0) });
    });
    data.push({ Section: '', Account: 'Total Equity', Amount: totalEquity });
    
    exportToCSV(data, `balance-sheet-${asOfDate}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Balance Sheet</h1>
            <p className="text-muted-foreground">Assets, Liabilities & Equity from POSTED vouchers</p>
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
          Draft and approved vouchers are not included.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>As of Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-[200px]">
            <Label>Date</Label>
            <Input 
              type="date" 
              value={asOfDate} 
              onChange={(e) => setAsOfDate(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Balance Check */}
      <Card className={isBalanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {isBalanced ? '✓ Balance Sheet is balanced' : '⚠️ Balance Sheet is NOT balanced'}
            </span>
            <div className="text-sm">
              <span className="mr-4">Assets: <strong>{formatCurrency(totalAssets)}</strong></span>
              <span>Liabilities + Equity: <strong>{formatCurrency(totalLiabilities + totalEquity)}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Assets */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-700">Assets</CardTitle>
              <CardDescription>What the company owns</CardDescription>
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
                  {assets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No asset accounts
                      </TableCell>
                    </TableRow>
                  ) : (
                    assets.map((a: any) => (
                      <TableRow key={a.id || a._id}>
                        <TableCell>{a.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(Math.abs(a.balance || 0))}</TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-blue-50 font-bold">
                    <TableCell>Total Assets</TableCell>
                    <TableCell className="text-right text-blue-600">{formatCurrency(totalAssets)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Liabilities & Equity */}
          <div className="space-y-6">
            {/* Liabilities */}
            <Card>
              <CardHeader className="bg-amber-50">
                <CardTitle className="text-amber-700">Liabilities</CardTitle>
                <CardDescription>What the company owes</CardDescription>
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
                    {liabilities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No liability accounts
                        </TableCell>
                      </TableRow>
                    ) : (
                      liabilities.map((a: any) => (
                        <TableRow key={a.id || a._id}>
                          <TableCell>{a.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Math.abs(a.balance || 0))}</TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableRow className="bg-amber-50 font-bold">
                      <TableCell>Total Liabilities</TableCell>
                      <TableCell className="text-right text-amber-600">{formatCurrency(totalLiabilities)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Equity */}
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-700">Equity</CardTitle>
                <CardDescription>Owner's stake</CardDescription>
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
                    {equity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No equity accounts
                        </TableCell>
                      </TableRow>
                    ) : (
                      equity.map((a: any) => (
                        <TableRow key={a.id || a._id}>
                          <TableCell>{a.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Math.abs(a.balance || 0))}</TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableRow className="bg-purple-50 font-bold">
                      <TableCell>Total Equity</TableCell>
                      <TableCell className="text-right text-purple-600">{formatCurrency(totalEquity)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Total L + E */}
            <Card className="bg-muted">
              <CardContent className="py-4">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Liabilities + Equity</span>
                  <span className="text-xl">{formatCurrency(totalLiabilities + totalEquity)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
