import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useRoles, useCreateUser, useUpdateUser } from '@/lib/hooks/useAdminModule';
import { formatRoleName } from '@/lib/constants/adminConstants';
import { formatDateTime } from '@/lib/utils/format';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Users,
  Loader2,
  Edit,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address').max(255),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must be less than 15 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.number().min(1, 'Please select a role'),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  isActive: z.boolean(),
  roleId: z.number().min(1, 'Please select a role'),
});

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: string;
}

export default function UsersList() {
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: 0,
    isActive: true,
  });

  // Filter users
  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.role?.name || '']
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Modal handlers
  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', password: '', roleId: 0, isActive: true });
    setErrors({});
    setShowDialog(true);
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      roleId: user.roleId || user.role?.id || 0,
      isActive: user.isActive ?? true,
    });
    setErrors({});
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingUser(null);
    setErrors({});
  };

  // Validate and save
  const handleSave = async () => {
    setErrors({});
    
    try {
      if (editingUser) {
        // Update validation
        const result = updateUserSchema.safeParse({
          name: form.name,
          phone: form.phone,
          isActive: form.isActive,
          roleId: form.roleId,
        });
        
        if (!result.success) {
          const fieldErrors: FormErrors = {};
          result.error.errors.forEach(err => {
            const field = err.path[0] as keyof FormErrors;
            fieldErrors[field] = err.message;
          });
          setErrors(fieldErrors);
          return;
        }

        setIsSaving(true);
        await updateUser.mutateAsync({
          id: editingUser.id,
          data: result.data,
        });
      } else {
        // Create validation
        const result = createUserSchema.safeParse({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          roleId: form.roleId,
        });
        
        if (!result.success) {
          const fieldErrors: FormErrors = {};
          result.error.errors.forEach(err => {
            const field = err.path[0] as keyof FormErrors;
            fieldErrors[field] = err.message;
          });
          setErrors(fieldErrors);
          return;
        }

        setIsSaving(true);
        await createUser.mutateAsync({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          password: result.data.password,
          roleId: result.data.roleId,
        });
      }

      closeDialog();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage system users with role-based access
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-success">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {users.filter(u => !u.isActive).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <CardTitle className="text-lg">All Users</CardTitle>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className="hover:bg-muted/30 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {user.phone ? (
                          <span className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant={user.role?.name?.includes('ADMIN') ? 'destructive' : 'secondary'}
                          className="gap-1"
                        >
                          <Shield className="h-3 w-3" />
                          {formatRoleName(user.role?.name || 'No Role')}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge 
                          variant={user.isActive ? 'default' : 'outline'}
                          className={user.isActive ? 'bg-success text-success-foreground' : ''}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(user)}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {search ? 'No users match your search criteria' : 'Get started by adding your first user'}
              </p>
              {!search && (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUser ? (
                <>
                  <Edit className="h-5 w-5" />
                  Edit User
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create New User
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Update user information and access settings'
                : 'Add a new user to the system with role-based access'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!!editingUser}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
              {editingUser && (
                <p className="text-xs text-muted-foreground">Email cannot be changed after creation</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>

            {/* Password (only for create) */}
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={form.roleId ? String(form.roleId) : ''}
                onValueChange={(value) => setForm({ ...form, roleId: Number(value) })}
              >
                <SelectTrigger className={errors.roleId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {formatRoleName(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-sm text-destructive">{errors.roleId}</p>
              )}
            </div>

            {/* Active Status (only for edit) */}
            {editingUser && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive users cannot log in to the system
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
