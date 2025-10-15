import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser, useCreateUser, useUpdateUser } from '@/lib/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  active: z.boolean().default(true),
});

const userEditSchema = userSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const { data: userData, isLoading } = useUser(id!);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const form = useForm<UserFormData>({
    resolver: zodResolver(isEdit ? userEditSchema : userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      password: '',
      active: true,
    },
  });

  // Load user data when editing
  React.useEffect(() => {
    if (userData && isEdit) {
      form.reset({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        department: userData.department || '',
        active: userData.active,
      });
    }
  }, [userData, isEdit, form]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEdit) {
        await updateUser.mutateAsync({ id: id!, data });
      } else {
        await createUser.mutateAsync(data);
      }
      navigate('/admin/users');
    } catch (error) {
      // Error already handled by mutation
    }
  };

  if (isLoading && isEdit) {
    return <div className="flex items-center justify-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit User' : 'Create User'}</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={[
                          { value: 'Admin', label: 'Admin' },
                          { value: 'ProjectManager', label: 'Project Manager' },
                          { value: 'PurchaseOfficer', label: 'Purchase Officer' },
                          { value: 'SiteEngineer', label: 'Site Engineer' },
                          { value: 'Accountant', label: 'Accountant' },
                          { value: 'Approver', label: 'Approver' },
                          { value: 'Viewer', label: 'Viewer' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a role"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={[
                          { value: 'Engineering', label: 'Engineering' },
                          { value: 'Purchase', label: 'Purchase' },
                          { value: 'Site', label: 'Site' },
                          { value: 'Accounts', label: 'Accounts' },
                          { value: 'Contracts', label: 'Contracts' },
                          { value: 'Admin', label: 'Admin' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select department"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        User can access the system
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
              {createUser.isPending || updateUser.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
