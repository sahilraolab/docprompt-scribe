import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProject, useCreateProject, useUpdateProject } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const projectSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  category: z.enum(['Residential', 'Commercial', 'Infrastructure', 'Industrial']).optional(),
  status: z.enum(['Planning', 'Active', 'OnHold', 'Completed', 'Cancelled']),
  budget: z.string().min(1, 'Budget is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  projectManager: z.string().min(1, 'Project manager is required'),
  siteEngineer: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const isEdit = !!id;

  const { data: projectData } = useProject(id || '');
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  // ✅ Users state
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      location: '',
      clientName: '',
      clientContact: '',
      category: undefined,
      status: 'Planning',
      budget: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      projectManager: '',
      siteEngineer: '',
    },
  });

  // ✅ Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem('erp_auth_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://88.222.244.251:5005/api'}/users`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.error('Failed to fetch users:', data);
          toast({ title: 'Failed to fetch users', variant: 'destructive' });
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({ title: 'Error fetching users', variant: 'destructive' });
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [toast]);

  // ✅ Reset form if editing
  useEffect(() => {
    if (projectData && isEdit) {
      form.reset({
        code: projectData.code || '',
        name: projectData.name,
        description: projectData.description || '',
        location: projectData.location || '',
        clientName: projectData.clientName || '',
        clientContact: projectData.clientContact || '',
        category: projectData.category,
        status: projectData.status,
        budget: String(projectData.budget ?? ''),
        startDate: (projectData.startDate || '').split('T')[0],
        endDate: projectData.endDate ? projectData.endDate.split('T')[0] : '',
        projectManager:
          projectData.projectManager?._id ||
          projectData.projectManager?.id ||
          projectData.projectManager ||
          '',
        siteEngineer:
          projectData.siteEngineer?._id ||
          projectData.siteEngineer?.id ||
          projectData.siteEngineer ||
          '',
      });
    }
  }, [projectData, isEdit, form]);

  // ✅ Dynamic user options
  const userOptions = users.map((u) => ({
    value: u._id,
    label: `${u.name} (${u.email})`,
  }));

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const projectPayload: any = {
        name: data.name,
        description: data.description,
        location: data.location,
        clientName: data.clientName,
        clientContact: data.clientContact,
        category: data.category,
        status: data.status,
        budget: parseFloat(data.budget),
        startDate: data.startDate,
        endDate: data.endDate,
        projectManager: data.projectManager,
        siteEngineer: data.siteEngineer,
        progress: 0,
      };

      if (isEdit && data.code) {
        projectPayload.code = data.code;
      }

      if (isEdit && id) {
        await updateProject.mutateAsync({ id, data: projectPayload });
        toast({ title: 'Project updated successfully!' });
      } else {
        await createProject.mutateAsync(projectPayload);
        toast({ title: 'Project created successfully!' });
      }

      navigate('/engineering/projects');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast({ title: 'Error saving project', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/projects')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Project</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update project details' : 'Create a new construction project'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ========== BASIC INFO ========== */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Auto-generated by system" disabled />
                      </FormControl>
                      <FormDescription>Automatically generated by the system</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={[
                            { value: 'Planning', label: 'Planning' },
                            { value: 'Active', label: 'Active' },
                            { value: 'OnHold', label: 'On Hold' },
                            { value: 'Completed', label: 'Completed' },
                            { value: 'Cancelled', label: 'Cancelled' },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select status"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Green Valley Apartments" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Brief description of the project" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={[
                            { value: 'Residential', label: 'Residential' },
                            { value: 'Commercial', label: 'Commercial' },
                            { value: 'Infrastructure', label: 'Infrastructure' },
                            { value: 'Industrial', label: 'Industrial' },
                          ]}
                          value={field.value || ''}
                          onChange={field.onChange}
                          placeholder="Select category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (₹) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} placeholder="10000000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* CLIENT INFO */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Client name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Contact</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+91 XXXXX XXXXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* TEAM ASSIGNMENT */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectManager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Manager *</FormLabel>
                      <FormControl>
                        {loadingUsers ? (
                          <div className="text-sm text-muted-foreground">Loading users...</div>
                        ) : (
                          <SearchableSelect
                            options={userOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select project manager"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteEngineer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Engineer</FormLabel>
                      <FormControl>
                        {loadingUsers ? (
                          <div className="text-sm text-muted-foreground">Loading users...</div>
                        ) : (
                          <SearchableSelect
                            options={userOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select site engineer"
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ========== TIMELINE ========== */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ========== LOCATION ========== */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Mumbai, Maharashtra" />
                    </FormControl>
                    <FormDescription>City, State or full address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ========== BUTTONS ========== */}
          <div className="flex gap-4">
            <Button type="submit">{isEdit ? 'Update Project' : 'Create Project'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/projects')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
