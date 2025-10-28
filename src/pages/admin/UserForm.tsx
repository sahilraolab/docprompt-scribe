import React, { useEffect, useState } from 'react';
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
import { ACTION_MAP, getRoleModulePermissions } from '@/lib/utils/permissions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  department: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  active: z.boolean().default(true),
  permissions: z
    .array(
      z.object({
        module: z.string(),
        actions: z.array(z.string()),
      })
    )
    .default([]),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: userData, isLoading } = useUser(id!);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [rolePermissions, setRolePermissions] = useState<
    { module: string; actions: string[] }[]
  >([]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      password: '',
      active: true,
      permissions: [],
    },
  });

  // Load existing user (edit)
  useEffect(() => {
    if (userData && isEdit) {
      form.reset({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role,
        department: userData.department || '',
        active: userData.active,
        permissions: userData.permissions || [],
      });
      setRolePermissions(userData.permissions || []);
    }
  }, [userData, isEdit, form]);

  // When role changes → auto-set default permissions (editable)
  const handleRoleChange = (role: string) => {
    const perms = getRoleModulePermissions(role);
    setRolePermissions(perms);
    form.setValue('permissions', perms);
    form.setValue('role', role);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      // Convert UI-friendly actions to backend-friendly enums
      data.permissions = rolePermissions.map((perm) => ({
        module: perm.module,
        actions: perm.actions.map((a) => ACTION_MAP[a] || a),
      }));

      if (isEdit) {
        await updateUser.mutateAsync({ id: id!, data });
        toast.success('User updated successfully');
      } else {
        await createUser.mutateAsync(data);
        toast.success('User created successfully');
      }

      navigate('/admin/users');
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (isLoading && isEdit)
    return <div className="flex items-center justify-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit User' : 'Create User'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? 'Update user information and permissions'
              : 'Add a new user to the system'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* BASIC INFO */}
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
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

              {/* Email */}
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

              {/* Phone */}
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

              {/* Role */}
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
                        onChange={handleRoleChange}
                        placeholder="Select a role"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
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

              {/* Active */}
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        User can access the system
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ROLE-BASED PERMISSIONS SECTION */}
          {rolePermissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Permissions for {form.watch('role')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rolePermissions.map((perm, i) => (
                  <div key={i} className="border rounded-md p-3">
                    <p className="font-semibold mb-2">{perm.module}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['View', 'Create', 'Edit', 'Delete', 'Approve', 'Config'].map(
                        (action) => (
                          <div key={action} className="flex items-center space-x-2">
                            <Checkbox
                              checked={perm.actions.includes(action)}
                              onCheckedChange={(checked) => {
                                const updated = [...rolePermissions];
                                const actions = checked
                                  ? [...perm.actions, action]
                                  : perm.actions.filter((a) => a !== action);
                                updated[i] = { ...perm, actions };
                                setRolePermissions(updated);
                              }}
                            />
                            <Label className="text-sm">{action}</Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* PASSWORD */}
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
                        type="password"
                        placeholder={
                          isEdit
                            ? 'Leave blank to keep existing password'
                            : 'Enter password'
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
              {createUser.isPending || updateUser.isPending
                ? 'Saving...'
                : isEdit
                  ? 'Update User'
                  : 'Create User'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
