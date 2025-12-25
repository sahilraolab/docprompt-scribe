import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Key,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

/* ----------------------------------
   Permission normalization
---------------------------------- */

const MODULE_LABELS: Record<string, string> = {
  engineering: 'Engineering',
  purchase: 'Purchase',
  site: 'Site',
  inventory: 'Inventory',
  contracts: 'Contracts',
  accounts: 'Accounts',
  workflow: 'Workflow',
  admin: 'Administration',
  masters: 'Masters',
  mis: 'MIS & Reports',
};

const ACTION_LABELS: Record<string, string> = {
  view: 'Read',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  approve: 'Approve',
  issue: 'Issue',
  post: 'Post',
  report: 'Reports',
  action: 'Actions',
};

function normalizePermissions(perms: string[]) {
  const map: Record<string, Set<string>> = {};
  perms.forEach((p) => {
    const parts = p.split('.');
    const action = parts.pop()!;
    const module = parts[0];
    if (!map[module]) map[module] = new Set();
    map[module].add(action);
  });
  return map;
}

/* ----------------------------------
   Component
---------------------------------- */

export default function UserProfile() {
  const { user } = useAuth();

  const [password, setPassword] = useState({
    current: '',
    next: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const permissions = normalizePermissions(user.permissions || []);

  /* ---------------- Password Change ---------------- */

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.next !== password.confirm) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await apiClient.request('/auth/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: password.current,
          newPassword: password.next,
        }),
      });
      toast.success('Password updated successfully');
      setPassword({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 w-full">
      <div className="space-y-6 animate-fade-in">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* PERSONAL INFO */}
        <Card className="enterprise-card w-full">
          <CardHeader className="enterprise-header">
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>
              Your account details and role information
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info icon={User} label="Full Name" value={user.name} />
                <Info icon={Mail} label="Email Address" value={user.email} />

                <Info
                  icon={Phone}
                  label="Phone Number"
                  value={user.phone || '—'}
                />

                <Info icon={Shield} label="Role" value={user.role} />

                <Info
                  icon={Calendar}
                  label="Member Since"
                  value={formatDate(user.createdAt)}
                />
              </div>

            </div>

            <div className="my-6 border-t" />

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Account Status
              </span>
              <Badge className="flex items-center gap-1 bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* CHANGE PASSWORD */}
        <Card className="enterprise-card w-full">
          <CardHeader className="enterprise-header">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <Field
                label="Current Password"
                value={password.current}
                onChange={(v) => setPassword({ ...password, current: v })}
              />
              <Field
                label="New Password"
                value={password.next}
                onChange={(v) => setPassword({ ...password, next: v })}
              />
              <Field
                label="Confirm New Password"
                value={password.confirm}
                onChange={(v) => setPassword({ ...password, confirm: v })}
              />

              <Button type="submit" disabled={loading}>
                <Key className="h-4 w-4 mr-2" />
                {loading ? 'Updating…' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* PERMISSIONS */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Your Permissions</CardTitle>
            </div>
            <CardDescription>
              Permissions granted to your role
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(permissions).map(([module, actions]) => (
                <div
                  key={module}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    <strong>{MODULE_LABELS[module] || module}:</strong>{' '}
                    {Array.from(actions)
                      .map((a) => ACTION_LABELS[a] || a)
                      .join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

/* ----------------------------------
   Small helpers
---------------------------------- */

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
}
