import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useProjects,
  usePlan,
  useCreatePlan,
  useUpdatePlan,
} from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Save, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const planSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.string().min(1, 'Status is required'),
  assignedTo: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface Task {
  _id?: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  progress?: number;
}

interface Milestone {
  _id?: string;
  name: string;
  date: string;
  completed: boolean;
}

export default function PlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  // Queries & Mutations
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const { data: planData, isLoading: loadingPlan } = usePlan(isEdit ? id! : '');
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  // Local states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form setup
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      projectId: '',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Draft',
      assignedTo: '',
    },
  });

  // ✅ Fetch users (for Assigned To)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const token = localStorage.getItem('erp_auth_token');
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://88.222.244.251:5005/api'}/users`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : '',
            },
          }
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setUsers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fix API shape (projectsApi returns { success, data })
  const projects = Array.isArray(projectsData)
    ? projectsData
    : Array.isArray(projectsData?.data)
      ? projectsData.data
      : [];

  const projectOptions =
    projects.map((p: any) => ({
      label: `${p.code ? `${p.code} - ` : ''}${p.name}`,
      value: p._id || p.id,
    })) || [];

  const userOptions =
    users.map((u) => ({
      label: u.name ? `${u.name} (${u.email})` : u.email,
      value: u._id,
    })) || [];

  // Load existing plan (Edit mode)
  useEffect(() => {
    if (isEdit && planData) {
      const plan = planData; // ✅ planData is the plan object itself

      form.reset({
        projectId: plan.projectId?._id || plan.projectId,
        name: plan.name || '',
        description: plan.description || '',
        startDate: plan.startDate?.split('T')[0] || '',
        endDate: plan.endDate?.split('T')[0] || '',
        status: plan.status || 'Draft',
        assignedTo: plan.assignedTo?._id || plan.assignedTo || '',
      });

      setTasks(plan.tasks || []);
      setMilestones(plan.milestones || []);
    }
  }, [isEdit, planData, form]);


  // Task & Milestone Handlers
  const addTask = () =>
    setTasks([
      ...tasks,
      {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'NotStarted',
        priority: 'Medium',
        progress: 0,
      },
    ]);

  const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));
  const updateTask = (index: number, field: keyof Task, value: string | number) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const addMilestone = () =>
    setMilestones([...milestones, { name: '', date: '', completed: false }]);
  const removeMilestone = (index: number) =>
    setMilestones(milestones.filter((_, i) => i !== index));
  const updateMilestone = (
    index: number,
    field: keyof Milestone,
    value: string | boolean
  ) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  // Submit Handler
  const onSubmit = async (data: PlanFormData) => {
    try {
      const payload: any = {
        ...data,
        tasks,
        milestones,
      };

      // 🧠 Fix ObjectId error: remove assignedTo if empty
      if (!payload.assignedTo) delete payload.assignedTo;

      if (isEdit) {
        await updatePlan.mutateAsync({ id: id!, data: payload });
        toast.success('Plan updated successfully');
      } else {
        await createPlan.mutateAsync(payload);
        toast.success('Plan created successfully');
      }

      navigate('/engineering/plans');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/plans')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Plan' : 'Create Plan'}</h1>
          <p className="text-muted-foreground">
            Define project timeline, milestones, and tasks
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isEdit && loadingPlan && (
        <div className="flex justify-center py-10 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading plan...
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <FormControl>
                      {loadingProjects ? (
                        <div className="text-sm text-muted-foreground">Loading projects...</div>
                      ) : (
                        <SearchableSelect
                          options={projectOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select project"
                          searchPlaceholder="Search projects..."
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ✅ Assigned To */}
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      {loadingUsers ? (
                        <div className="text-sm text-muted-foreground">Loading users...</div>
                      ) : (
                        <SearchableSelect
                          options={userOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select user (optional)"
                          searchPlaceholder="Search users..."
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Q1 2025 Construction Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter plan description..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ---------- Tasks Section ---------- */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Tasks</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addTask}>
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks yet. Click “Add Task” to create one.
                </p>
              ) : (
                tasks.map((task, index) => (
                  <Card key={index} className="mb-4 border">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between">
                        <h4 className="font-semibold">Task {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <Input
                        placeholder="Task name"
                        value={task.name}
                        onChange={(e) => updateTask(index, 'name', e.target.value)}
                      />

                      <Textarea
                        placeholder="Task description"
                        rows={2}
                        value={task.description}
                        onChange={(e) => updateTask(index, 'description', e.target.value)}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="date"
                          value={task.startDate}
                          onChange={(e) => updateTask(index, 'startDate', e.target.value)}
                        />
                        <Input
                          type="date"
                          value={task.endDate}
                          onChange={(e) => updateTask(index, 'endDate', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          value={task.status}
                          onValueChange={(val) => updateTask(index, 'status', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NotStarted">Not Started</SelectItem>
                            <SelectItem value="InProgress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={task.priority}
                          onValueChange={(val) => updateTask(index, 'priority', val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* ---------- Milestones Section ---------- */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Milestones</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-2" /> Add Milestone
              </Button>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No milestones yet. Click “Add Milestone” to create one.
                </p>
              ) : (
                milestones.map((m, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg mb-2"
                  >
                    <Input
                      placeholder="Milestone name"
                      value={m.name}
                      onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={m.date}
                      onChange={(e) => updateMilestone(index, 'date', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/engineering/plans')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPlan.isPending || updatePlan.isPending}>
              {(createPlan.isPending || updatePlan.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
