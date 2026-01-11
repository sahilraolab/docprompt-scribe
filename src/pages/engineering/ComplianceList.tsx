import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

import { Shield, Plus, Lock } from 'lucide-react';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { useMasterProjects } from '@/lib/hooks/useMasters';
import { complianceApi } from '@/lib/api/engineeringApi';

/* ================= STATUS STYLES ================= */

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  CLOSED: 'bg-green-500/10 text-green-700 border-green-500/20'
};

export default function ComplianceList() {
  const navigate = useNavigate();
  const { data: projects = [] } = useMasterProjects();

  const [loading, setLoading] = useState(false);

  /**
   * complianceByProject[projectId] = Compliance[]
   */
  const [complianceByProject, setComplianceByProject] =
    useState<Record<number, any[]>>({});

  /* ================= LOAD PROJECT-WISE COMPLIANCE ================= */

  useEffect(() => {
    if (!projects.length) return;

    (async () => {
      setLoading(true);
      const map: Record<number, any[]> = {};

      for (const project of projects) {
        try {
          const res = await complianceApi.list(project.id);
          map[project.id] = Array.isArray(res) ? res : [];
        } catch {
          map[project.id] = [];
        }
      }

      setComplianceByProject(map);
      setLoading(false);
    })();
  }, [projects]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance"
        description="Project-wise statutory & regulatory compliance"
        actions={[
          {
            label: 'Add Compliance',
            icon: Plus,
            onClick: () => navigate('/engineering/compliance/new')
          }
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Document Ref</TableHead>
                <TableHead>Valid Till</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Blocking</TableHead>
                <TableHead className="w-[100px] text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.map(project => {
                const list = complianceByProject[project.id] || [];

                /* -------- NO COMPLIANCE -------- */
                if (list.length === 0) {
                  return (
                    <TableRow key={`empty-${project.id}`}>
                      <TableCell>
                        <div className="font-medium">
                          {project.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.code}
                        </div>
                      </TableCell>

                      <TableCell
                        colSpan={5}
                        className="text-muted-foreground"
                      >
                        No compliance records
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/engineering/compliance/new?projectId=${project.id}`
                            )
                          }
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }

                /* -------- COMPLIANCE ROWS -------- */
                return list.map(c => {
                  const isClosed = c.status === 'CLOSED';

                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium">
                          {project.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {project.code}
                        </div>
                      </TableCell>

                      <TableCell>{c.type}</TableCell>

                      <TableCell>
                        {c.documentRef || '-'}
                      </TableCell>

                      <TableCell>
                        {c.validTill
                          ? format(
                              new Date(c.validTill),
                              'dd MMM yyyy'
                            )
                          : '-'}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[c.status]}
                        >
                          {isClosed && (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          {c.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {c.blocking ? (
                          <Badge variant="destructive">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            No
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={isClosed}
                          onClick={() =>
                            navigate(
                              `/engineering/compliance/${c.id}/edit`
                            )
                          }
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
