import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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

import {
  Plus,
  CheckCircle,
  Lock,
  Loader2
} from 'lucide-react';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { useMasterProjects } from '@/lib/hooks/useMasters';
import { drawingsApi } from '@/lib/api/engineeringApi';
import { useApproveDrawing } from '@/lib/hooks/useEngineering';

/* ================= STATUS STYLES ================= */

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20'
};

export default function DrawingsList() {
  const navigate = useNavigate();
  const approveDrawing = useApproveDrawing();

  const { data: projects = [] } = useMasterProjects();

  const [loading, setLoading] = useState(false);
  const [approveId, setApproveId] = useState<number | null>(null);

  /**
   * drawingsByProject[projectId] = Drawing[]
   */
  const [drawingsByProject, setDrawingsByProject] =
    useState<Record<number, any[]>>({});

  /* ================= LOAD ALL PROJECT DRAWINGS ================= */

  useEffect(() => {
    if (!projects.length) return;

    (async () => {
      setLoading(true);

      const map: Record<number, any[]> = {};

      for (const project of projects) {
        try {
          const res = await drawingsApi.list(project.id);
          map[project.id] = Array.isArray(res) ? res : [];
        } catch {
          map[project.id] = [];
        }
      }

      setDrawingsByProject(map);
      setLoading(false);
    })();
  }, [projects]);

  /* ================= APPROVE ================= */

  const handleApprove = () => {
    if (!approveId) return;

    approveDrawing.mutate(approveId, {
      onSuccess: () => {
        toast.success('Drawing approved');
        setApproveId(null);

        setDrawingsByProject(prev => {
          const updated = { ...prev };

          Object.keys(updated).forEach(pid => {
            updated[Number(pid)] = updated[Number(pid)].map(d =>
              d.id === approveId ? { ...d, status: 'APPROVED' } : d
            );
          });

          return updated;
        });
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to approve drawing');
      }
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drawings"
        description="All project-wise engineering drawings"
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Drawing No</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[140px] text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.map(project => {
                const drawings = drawingsByProject[project.id] || [];

                /* -------- NO DRAWINGS -------- */
                if (drawings.length === 0) {
                  return (
                    <TableRow key={`empty-${project.id}`}>
                      <TableCell>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.code}
                        </div>
                      </TableCell>

                      <TableCell colSpan={4} className="text-muted-foreground">
                        No drawings
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/engineering/drawings/new?projectId=${project.id}`
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

                /* -------- DRAWINGS -------- */
                return drawings.map(drawing => {
                  const isApproved = drawing.status === 'APPROVED';

                  return (
                    <TableRow key={drawing.id}>
                      <TableCell>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {project.code}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono">
                        {drawing.drawingNo}
                      </TableCell>

                      <TableCell>{drawing.title}</TableCell>

                      <TableCell>{drawing.discipline || '-'}</TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_COLORS[drawing.status]}
                        >
                          {isApproved && (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          {drawing.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        {!isApproved && (
                          <>
                            {/* REVISE */}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/engineering/drawings/${drawing.id}?mode=revise`)
                              }
                              title="Revise Drawing"
                            >
                              ✏️
                            </Button>

                            {/* APPROVE */}
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setApproveId(drawing.id)}
                              title="Approve Drawing"
                            >
                              {approveDrawing.isPending &&
                                approveId === drawing.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </Button>
                          </>
                        )}

                        {isApproved && (
                          <span title="Approved & Locked">
                            <Lock className="h-4 w-4 text-muted-foreground inline" />
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!approveId}
        onOpenChange={() => setApproveId(null)}
        title="Approve Drawing"
        description="Once approved, this drawing is locked and cannot be revised."
        confirmText="Approve Drawing"
        onConfirm={handleApprove}
      />
    </div>
  );
}
