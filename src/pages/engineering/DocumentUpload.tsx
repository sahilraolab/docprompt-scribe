import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateDocument } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { data: projectsData } = useProjects();
  const createDocument = useCreateDocument();
  
  const [uploading, setUploading] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  // File upload is not handled on backend; using URL-based upload


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!projectId || !documentType || !name || !url) {
      toast.error('Please fill all required fields including a valid file URL');
      return;
    }

    setUploading(true);
    
    try {
      const payload = {
        projectId,
        name,
        type: documentType,
        version: parseInt(version) || 1,
        description: description || undefined,
        url,
      };

      await createDocument.mutateAsync(payload);
      navigate('/engineering/documents');
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground">Upload project drawings and files</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/engineering/documents')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Select required value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectsData?.data?.map((project: any) => (
                      <SelectItem key={project._id || project.id} value={(project._id || project.id)}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Document Type *</Label>
                <Select required value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Permit">Permit</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Drawing">Drawing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Document Name *</Label>
                <Input 
                  id="title" 
                  placeholder="Enter document name" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version" 
                  placeholder="e.g., 1" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter document description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label htmlFor="url">File URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/path/to/file.pdf"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">Backend expects a URL; direct file uploads are not enabled.</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Saving...' : 'Save Document'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/engineering/documents')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
