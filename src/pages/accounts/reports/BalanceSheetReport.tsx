import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAccounts } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';

export default function BalanceSheetReport() {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading } = useAccounts();

  const assets = useMemo(() => accounts.filter((a) => a.type === 'Asset'), [accounts]);
  const liabilities = useMemo(() => accounts.filter((a) => a.type === 'Liability'), [accounts]);
  const equity = useMemo(() => accounts.filter((a) => a.type === 'Equity'), [accounts]);

  const totals = useMemo(() => {
    const assetsTotal = assets.reduce((s, a) => s + Math.abs(a.balance || 0), 0);
    const liabilitiesTotal = liabilities.reduce((s, a) => s + Math.abs(a.balance || 0), 0);
    const equityTotal = equity.reduce((s, a) => s + Math.abs(a.balance || 0), 0);
    return { assetsTotal, liabilitiesTotal, equityTotal };
  }, [assets, liabilities, equity]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Balance Sheet</h1>
          <p className="text-muted-foreground">Assets, liabilities, and equity</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(totals.assetsTotal)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(totals.liabilitiesTotal)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Equity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? 'Loading...' : <p className="text-2xl font-bold">{formatCurrency(totals.equityTotal)}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
