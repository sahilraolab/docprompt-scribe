import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText, FolderOpen, Calendar, Package, ListChecks, TrendingUp, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';

export default function EngineeringIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Projects',
      description: 'Manage construction projects',
      icon: Building,
      path: '/engineering/projects',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Material Master',
      description: 'Master database for all materials',
      icon: Package,
      path: '/engineering/materials',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'BOQ',
      description: 'Bill of Quantities management',
      icon: ListChecks,
      path: '/engineering/boq',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Estimates',
      description: 'Project cost estimates with versioning',
      icon: FileText,
      path: '/engineering/estimates',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Documents',
      description: 'Drawings, reports, and files',
      icon: FolderOpen,
      path: '/engineering/documents',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Plans & Tasks',
      description: 'Project planning and task management',
      icon: Calendar,
      path: '/engineering/plans',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engineering</h1>
        <p className="text-muted-foreground mt-1">Project management and documentation</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Projects"
          value="11"
          description="+2 this month"
          icon={Building}
          trend={{ value: 18, isPositive: true }}
        />
        <KPICard
          title="Total Budget"
          value={formatCurrency(45000000, 'short')}
          description="All projects"
          icon={DollarSign}
        />
        <KPICard
          title="Materials"
          value="1,248"
          description="In master database"
          icon={Package}
        />
        <KPICard
          title="Documents"
          value="342"
          description="Uploaded"
          icon={FolderOpen}
        />
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
