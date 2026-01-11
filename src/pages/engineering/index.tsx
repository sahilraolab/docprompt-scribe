import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/KPICard';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import {
  FileText,
  TrendingUp,
  DollarSign,
  Download,
  FolderOpen,
  Shield,
  Building
} from 'lucide-react';

import { formatCurrency } from '@/lib/utils/format';
import {
  estimatesApi,
  bbsApi,
  drawingsApi,
  budgetApi
} from '@/lib/api/engineeringApi';
import { projectsApi } from '@/lib/api/mastersApi';
import {
  exportToCSV,
  exportToExcel,
  printElement
} from '@/lib/utils/export';

export default function EngineeringIndex() {
  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);

  const [estimates, setEstimates] = useState<any[]>([]);
  const [bbs, setBBS] = useState<any[]>([]);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [budget, setBudget] = useState<any | null>(null);

  /* ================= INIT ================= */

  useEffect(() => {
    document.title = 'Engineering Dashboard | ERP';
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);

      if (data.length > 0) {
        setProjectId(data[0].id); // default selection
      }
    } catch {
      toast.error('Failed to load projects');
    }
  };

  /* ================= PROJECT-SCOPED LOAD ================= */

  useEffect(() => {
    if (!projectId) return;

    (async () => {
      try {
        const [
          est,
          bbsRows,
          draw,
          bud
        ] = await Promise.all([
          estimatesApi.list(projectId),
          bbsApi.list(projectId),
          drawingsApi.list(projectId),
          budgetApi.getByProject(projectId)
        ]);

        setEstimates(est);
        setBBS(bbsRows);
        setDrawings(draw);
        setBudget(bud);
      } catch {
        toast.error('Failed to load engineering data');
      }
    })();
  }, [projectId]);

  /* ================= DERIVED STATS ================= */

  const stats = {
    totalProjects: projects.length,
    totalBudget: budget?.totalBudget || 0,
    totalEstimates: estimates.length,
    draftEstimates: estimates.filter(e => e.status === 'DRAFT').length,
    totalBBS: bbs.length,
    totalDrawings: drawings.length
  };

  /* ================= EXPORT DATA ================= */

  const exportRows = [
    ...estimates.map(e => ({
      type: 'Estimate',
      name: e.name,
      status: e.status,
      amount: e.baseAmount
    })),
    ...bbs.map(b => ({
      type: 'BBS',
      code: b.code,
      quantity: b.quantity,
      rate: b.rate,
      amount: b.amount,
      status: b.status
    }))
  ];

  /* ================= MODULE CARDS ================= */

  const modules = [
    {
      title: 'Estimates',
      description: 'Project cost estimates & versions',
      icon: FileText,
      path: '/engineering/estimates'
    },
    {
      title: 'BBS',
      description: 'Bar Bending Schedule (BOQ)',
      icon: TrendingUp,
      path: '/engineering/bbs'
    },
    {
      title: 'Budget',
      description: 'Project budget allocation',
      icon: DollarSign,
      path: '/engineering/budget'
    },
    {
      title: 'Drawings',
      description: 'Engineering drawings & revisions',
      icon: FolderOpen,
      path: '/engineering/drawings'
    },
    {
      title: 'Compliance',
      description: 'Statutory & regulatory compliance',
      icon: Shield,
      path: '/engineering/compliance'
    }
  ];

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      {/* Header + Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Engineering Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Project-wise engineering overview
          </p>
        </div>

        <div className="w-full md:w-72">
          <Select
            value={projectId?.toString()}
            onValueChange={(val) => setProjectId(Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name} ({p.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        id="engineering-dashboard"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <KPICard title="Projects" value={stats.totalProjects} icon={Building} />
        <KPICard
          title="Budget"
          value={formatCurrency(stats.totalBudget, 'short')}
          icon={DollarSign}
        />
        <KPICard
          title="Estimates"
          value={stats.totalEstimates}
          description={`${stats.draftEstimates} draft`}
          icon={FileText}
        />
        <KPICard title="BBS" value={stats.totalBBS} icon={TrendingUp} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            {estimates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No estimates</p>
            ) : (
              estimates.slice(0, 5).map(e => (
                <div
                  key={e.id}
                  className="flex justify-between py-2 border-b last:border-0"
                >
                  <span>{e.name}</span>
                  <span>{formatCurrency(e.baseAmount)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Drawings</CardTitle>
          </CardHeader>
          <CardContent>
            {drawings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No drawings</p>
            ) : (
              drawings.slice(0, 5).map(d => (
                <div
                  key={d.id}
                  className="py-2 border-b last:border-0"
                >
                  {d.drawingNo} — {d.status}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>
            Download engineering data for selected project
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => exportToCSV(exportRows, 'engineering')}>
            <Download className="h-4 w-4 mr-2" /> CSV
          </Button>
          <Button
            variant="secondary"
            onClick={() => exportToExcel(exportRows, 'engineering')}
          >
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => printElement('engineering-dashboard')}
          >
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(m => (
          <Card
            key={m.path}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(m.path)}
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <m.icon className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle className="text-base">{m.title}</CardTitle>
                <CardDescription>{m.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
