import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Plus, Search, FileImage, CheckCircle } from 'lucide-react';
import { useDrawings, useApproveDrawing } from '@/lib/hooks/useEngineering';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import type { Drawing } from '@/types/engineering';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  APPROVED: 'bg-green-500/10 text-green-600 border-green-500/20',
};

export default function DrawingsList() {
  const navigate = useNavigate();
  const { data: drawings = [], isLoading } = useDrawings();
  const approveDrawing = useApproveDrawing();
  const [search, setSearch] = useState('');

  const filtered = (drawings as Drawing[]).filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase()) ||
    d.drawingNo?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drawings"
        description="Manage engineering drawings and revisions"
        actions={[
          { label: 'Add Drawing', onClick: () => navigate('/engineering/drawings/new'), icon: Plus }
        ]}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drawings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={FileImage}
              title="No drawings found"
              description="Upload your first drawing"
              action={{ label: 'Add Drawing', onClick: () => navigate('/engineering/drawings/new') }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drawing No.</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((drawing) => (
                  <TableRow key={drawing.id} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/engineering/drawings/${drawing.id}`)}>
                    <TableCell className="font-mono text-sm">{drawing.drawingNo}</TableCell>
                    <TableCell className="font-medium">{drawing.title}</TableCell>
                    <TableCell>{drawing.discipline || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[drawing.status] || ''}>
                        {drawing.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          approveDrawing.mutate(String(drawing.id));
                        }}
                        disabled={drawing.status === 'APPROVED'}
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
