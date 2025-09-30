import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import { Building2, DollarSign, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const kpis = [
    { title: 'Active Projects', value: '5', icon: Building2, color: 'text-blue-500' },
    { title: 'Total Budget', value: formatCurrency(37500000000), icon: DollarSign, color: 'text-green-500' },
    { title: 'Pending Approvals', value: '3', icon: Clock, color: 'text-amber-500' },
    { title: 'Overdue SLAs', value: '1', icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's your project overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Projects</CardTitle>
            <Button variant="ghost" onClick={() => navigate('/engineering/projects')}>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'proj-1', name: 'Skyline Towers', progress: 45, budget: 15000000000, city: 'Mumbai' },
              { id: 'proj-2', name: 'Green Valley Apartments', progress: 25, budget: 5000000000, city: 'Pune' },
              { id: 'proj-3', name: 'Tech Park Phase II', progress: 90, budget: 8000000000, city: 'Bangalore' },
            ].map((project) => (
              <div 
                key={project.id} 
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/engineering/projects/${project.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-sm text-muted-foreground">{formatPercent(project.progress)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{project.city}</span>
                    <span>•</span>
                    <span>{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
