import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Building2, Receipt, Percent } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';

export default function PartnersIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Partners',
      description: 'Manage investors and partners',
      icon: Users,
      path: '/partners/list',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Project Investments',
      description: 'Capital contributions and shares',
      icon: Building2,
      path: '/partners/investments',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Profit Events',
      description: 'Track and distribute profits',
      icon: TrendingUp,
      path: '/partners/profit-events',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Distributions',
      description: 'Partner payout history',
      icon: Receipt,
      path: '/partners/distributions',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Partners & Investments</h1>
        <p className="text-muted-foreground mt-1">Manage partners, investments and profit distributions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Partners"
          value="15"
          description="Active investors"
          icon={Users}
        />
        <KPICard
          title="Total Investment"
          value={formatCurrency(125000000, 'short')}
          description="Capital contributions"
          icon={DollarSign}
        />
        <KPICard
          title="Pending Distributions"
          value={formatCurrency(8500000, 'short')}
          description="Profit to distribute"
          icon={Receipt}
        />
        <KPICard
          title="Active Projects"
          value="8"
          description="With partner investments"
          icon={Building2}
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all border-t-4 hover:border-t-primary"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-4 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-8 w-8 ${module.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
