import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/EmptyState';

import {
  Plus,
  Search,
  Users,
  Loader2,
  X,
  Save,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/* ----------------------------------
   Types
---------------------------------- */
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: {
    name: string;
  };
}

/* ----------------------------------
   Helpers
---------------------------------- */
const formatRole = (role: string) =>
  role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

const roleBadgeVariant = (role: string) =>
  role.includes('ADMIN') ? 'destructive' : 'secondary';

/* ----------------------------------
   Component
---------------------------------- */
export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  /* ---------------- Fetch users ---------------- */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.request('/admin/users');
      setUsers(res || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- Search ---------------- */
  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.role?.name]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* ---------------- Modal handlers ---------------- */
  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', password: '' });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const saveUser = async () => {
    try {
      if (editingUser) {
        await apiClient.request(`/admin/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
          }),
        });
      } else {
        await apiClient.request('/admin/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }

      closeModal();
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to save user');
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and access roles
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openEdit(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>

                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '—'}</TableCell>

                      <TableCell>
                        <Badge variant={roleBadgeVariant(user.role.name)}>
                          {formatRole(user.role.name)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No users found"
              description={
                search
                  ? 'No users match your search'
                  : 'Add users to get started'
              }
            />
          )}
        </CardContent>
      </Card>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingUser ? 'Edit User' : 'Create User'}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  disabled={!!editingUser}
                  value={form.email}
                  onChange={e =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={form.phone}
                  onChange={e =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={e =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button onClick={saveUser}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
