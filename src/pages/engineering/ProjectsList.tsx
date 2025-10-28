import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/lib/hooks/useEngineering';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, FileText } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/format';
import { exportToCSV, exportToExcel } from '@/lib/utils/export';
import { Project } from '@/types';
import { INDIAN_STATES } from '@/lib/constants';
import { j } from 'node_modules/msw/lib/core/HttpResponse-DzhqZzTK';

export default function ProjectsList() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(()=>{
    console.log("<><><><><L<KLKLK")
    console.log(projects);
  }, [projects])

  // Filter projects
  const filteredProjects = (projects || []).filter((project: any) => {
    console.log("Projects Data From Hook:", projects);
    const q = searchQuery.toLowerCase();
    const name = (project.name || '').toLowerCase();
    const code = (project.code || '').toLowerCase();
    const location = (project.location || '').toLowerCase();
    const matchesSearch = name.includes(q) || code.includes(q) || location.includes(q);

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesState = stateFilter === 'all' || (project.location || '').toLowerCase().includes(stateFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesState;
  });
  // Sort projects
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'code':
        return a.code.localeCompare(b.code);
      case 'budget':
        return b.budget - a.budget;
      case 'progress':
        return b.progress - a.progress;
      case 'startDate':
        return new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime();
      default:
        return 0;
    }
  });

  // Table columns
  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (project: any) => (
        <span className="font-medium">{project.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Project Name',
      render: (project: any) => (
        <div>
          <p className="font-medium">{project.name}</p>
          {project.location && (
            <p className="text-sm text-muted-foreground">{project.location}</p>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (project: any) => <StatusBadge status={project.status} />,
    },
    {
      key: 'budget',
      header: 'Budget',
      render: (project: any) => formatCurrency(project.budget),
      className: 'text-right',
    },
    {
      key: 'spent',
      header: 'Spent',
      render: (project: any) => formatCurrency(project.budgetUtilized ?? project.spent ?? 0),
      className: 'text-right',
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (project: any) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium w-12 text-right">
            {formatPercent(project.progress)}
          </span>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (project: any) => formatDate(project.startDate),
    },
  ];

  // Export handlers
  const handleExportCSV = () => {
    const exportData = sortedProjects.map(p => ({
      Code: p.code,
      Name: p.name,
      Location: p.location,
      Status: p.status,
      Budget: p.budget,
      Spent: p.budgetUtilized || 0,
      Progress: `${p.progress}%`,
      'Start Date': formatDate(p.startDate),
      Manager: p.projectManager?.name || 'N/A',
    }));
    exportToCSV(exportData, 'projects');
  };

  const handleExportExcel = () => {
    const exportData = sortedProjects.map(p => ({
      Code: p.code,
      Name: p.name,
      Location: p.location,
      Status: p.status,
      Budget: p.budget,
      Spent: p.budgetUtilized || 0,
      Progress: `${p.progress}%`,
      'Start Date': formatDate(p.startDate),
      Manager: p.projectManager?.name || 'N/A',
    }));
    exportToExcel(exportData, 'projects');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your construction projects"
        actions={[
          {
            label: 'New Project',
            onClick: () => navigate('/engineering/projects/new'),
            icon: Plus,
          },
        ]}
      />

      <Card className="p-6">
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search projects..."
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="OnHold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="startDate">Start Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {sortedProjects.length} of {projects.length} projects
          </div>

          {/* Data Table */}
          <DataTable
            data={sortedProjects}
            columns={columns}
            onRowClick={(project) => navigate(`/engineering/projects/${project._id || project.id}`)}
            isLoading={isLoading}
            emptyMessage="No projects found"
          />
        </div>
      </Card>
    </div>
  );
}
