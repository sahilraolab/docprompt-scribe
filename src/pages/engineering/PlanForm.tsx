import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjects, usePlan, useCreatePlan, useUpdatePlan } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
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
}

export default function PlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rawId = id;
  const isEdit = !!rawId && rawId !== 'new';

  const { data: projectsData } = useProjects();
  const { data: planData } = usePlan(isEdit ? (rawId as string) : '');
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const projects = projectsData?.data || [];
  const plan = planData?.data;

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

  useEffect(() => {
    if (isEdit && plan) {
      form.reset({
        projectId: plan.projectId?._id || plan.projectId,
        name: plan.name,
        description: plan.description || '',
        startDate: plan.startDate?.split('T')[0],
        endDate: plan.endDate?.split('T')[0],
        status: plan.status,
        assignedTo: plan.assignedTo?._id || plan.assignedTo || '',
      });
      if (plan.tasks) {
        setTasks(plan.tasks);
      }
    }
  }, [plan, isEdit, form]);

  const onSubmit = async (data: PlanFormData) => {
    try {
      const payload = {
        ...data,
        tasks,
      };

      if (isEdit) {
        await updatePlan.mutateAsync({ id: rawId!, data: payload });
        toast.success('Plan updated successfully');
      } else {
        await createPlan.mutateAsync(payload);
        toast.success('Plan created successfully');
      }
      navigate('/engineering/plans');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save plan');
    }
  };

  const addTask = () => {
    const newTask: Task = {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'NotStarted',
      priority: 'Medium',
    };
    setTasks([...tasks, newTask]);
    setShowTaskForm(true);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof Task, value: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const projectOptions = projects.map((p: any) => ({
    label: `${p.name} (${p.code})`,
    value: p._id || p.id,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/engineering/plans')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit Plan' : 'Create New Plan'}</h1>
          <p className="text-muted-foreground">Define project timeline, milestones and tasks</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={projectOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select project"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter plan description..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tasks</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks added yet. Click "Add Task" to create tasks.
                </p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
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
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Task Name</label>
                            <Input
                              value={task.name}
                              onChange={(e) => updateTask(index, 'name', e.target.value)}
                              placeholder="Enter task name"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                              value={task.description}
                              onChange={(e) => updateTask(index, 'description', e.target.value)}
                              placeholder="Enter task description"
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Start Date</label>
                              <Input
                                type="date"
                                value={task.startDate}
                                onChange={(e) => updateTask(index, 'startDate', e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">End Date</label>
                              <Input
                                type="date"
                                value={task.endDate}
                                onChange={(e) => updateTask(index, 'endDate', e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Status</label>
                              <Select 
                                value={task.status}
                                onValueChange={(value) => updateTask(index, 'status', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NotStarted">Not Started</SelectItem>
                                  <SelectItem value="InProgress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Blocked">Blocked</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Priority</label>
                              <Select 
                                value={task.priority}
                                onValueChange={(value) => updateTask(index, 'priority', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/engineering/plans')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPlan.isPending || updatePlan.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
