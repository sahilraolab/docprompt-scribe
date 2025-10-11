import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useEstimatesByProject, useDocumentsByProject } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { KPICard } from '@/components/KPICard';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/format';
import { 
  ArrowLeft, 
  Edit, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MapPin,
  User,
  Loader2,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading } = useProject(id!);
  const { data: estimatesData, isLoading: estimatesLoading } = useEstimatesByProject(id!);
  const { data: documentsData, isLoading: documentsLoading } = useDocumentsByProject(id!);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <Button onClick={() => navigate('/engineering/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const budgetUtilization = (project.spent / project.budget) * 100;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
  const API_ORIGIN = (() => { try { return new URL(API_URL).origin; } catch { return (API_URL || '').replace(/\/api$/, ''); } })();
  const buildFileUrl = (u?: string) => {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return `${API_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`;
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/engineering/projects')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-muted-foreground">{project.code}</p>
        </div>
        <Button onClick={() => navigate(`/engineering/projects/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total Budget"
          value={formatCurrency(project.budget)}
          icon={DollarSign}
        />
        <KPICard
          title="Spent"
          value={formatCurrency(project.spent)}
          icon={TrendingUp}
          description={`${formatPercent(budgetUtilization)} utilized`}
        />
        <KPICard
          title="Progress"
          value={formatPercent(project.progress)}
          icon={TrendingUp}
        />
        <KPICard
          title="Start Date"
          value={formatDate(project.startDate)}
          icon={Calendar}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="plans">Plans & Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project Code</p>
                  <p className="font-medium">{project.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={project.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{project.city}, {project.state}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Project Manager</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{project.managerId?.name || project.managerName || 'Not assigned'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="font-medium">{formatDate(project.startDate)}</p>
                </div>
                {project.endDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">{formatDate(project.endDate)}</p>
                  </div>
                )}
                {project.reraId && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">RERA ID</p>
                    <p className="font-medium">{project.reraId}</p>
                  </div>
                )}
              </div>

              {project.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{project.description}</p>
                </div>
              )}

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">Budget Utilization</p>
                <div className="w-full bg-secondary rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all"
                    style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-muted-foreground">
                    Spent: {formatCurrency(project.spent)}
                  </span>
                  <span className="text-muted-foreground">
                    Budget: {formatCurrency(project.budget)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estimates</CardTitle>
                <Button size="sm" onClick={() => navigate('/engineering/estimates/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Estimate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {estimatesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : estimatesData?.data && estimatesData.data.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estimatesData.data.map((est: any) => (
                        <TableRow key={est._id}>
                          <TableCell className="font-medium">v{est.version}</TableCell>
                          <TableCell>{est.description || 'No description'}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(est.total)}</TableCell>
                          <TableCell><StatusBadge status={est.status} /></TableCell>
                          <TableCell>{formatDate(est.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/engineering/estimates/${est._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No estimates available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button size="sm" onClick={() => navigate('/engineering/documents/upload')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : documentsData?.data && documentsData.data.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Uploaded By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documentsData.data.map((doc: any) => (
                        <TableRow key={doc._id}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.type}</Badge>
                          </TableCell>
                          <TableCell>v{doc.version}</TableCell>
                          <TableCell>{doc.uploadedBy?.name || 'N/A'}</TableCell>
                          <TableCell>{formatDate(doc.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(buildFileUrl(doc.url), '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = buildFileUrl(doc.url);
                                  link.download = doc.name;
                                  link.click();
                                }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No documents uploaded yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Plans & Tasks</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No plans created yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
