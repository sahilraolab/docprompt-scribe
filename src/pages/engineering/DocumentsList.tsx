import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Download, Eye, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
const API_ORIGIN = (() => { try { return new URL(API_URL).origin; } catch { return (API_URL || '').replace(/\/api$/, ''); } })();
const buildFileUrl = (u?: string) => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`;
};

export default function DocumentsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: documents = [], isLoading } = useDocuments();
  const filteredDocuments = documents.filter((doc: any) =>
    doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.projectId?.name || doc.projectName || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    doc.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Drawing':
        return 'bg-blue-100 text-blue-800';
      case 'Report':
        return 'bg-green-100 text-green-800';
      case 'BOQ':
        return 'bg-purple-100 text-purple-800';
      case 'Photo':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Documents</h1>
          <p className="text-muted-foreground">Manage drawings, reports, and files</p>
        </div>
        <Button onClick={() => navigate('/engineering/documents/upload')}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name, project, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc: any) => (
                    <TableRow key={doc._id || doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(doc.type)} variant="secondary">
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.projectId?.name || doc.projectName || 'N/A'}</TableCell>
                      <TableCell>v{doc.version}</TableCell>
                      <TableCell>{doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</TableCell>
                      <TableCell>{doc.uploadedBy?.name || doc.createdBy?.name || 'N/A'}</TableCell>
                      <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open(buildFileUrl(doc.url), '_blank', 'noopener') }>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => window.open(buildFileUrl(doc.url), '_blank', 'noopener') }>
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
            <EmptyState
              icon={FileText}
              title="No documents found"
              description={
                searchQuery
                  ? "No documents match your search criteria"
                  : "Upload project documents, drawings, and reports"
              }
              action={
                !searchQuery
                  ? {
                      label: "Upload Document",
                      onClick: () => navigate('/engineering/documents/upload'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
