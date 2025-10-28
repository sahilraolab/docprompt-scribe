import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useProfile,
  useChangePassword,
  useUpdateNotifications,
} from '@/lib/hooks/useProfile';
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
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Phone,
  Building,
  Shield,
  Clock,
  Edit,
  Key,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ All hooks must be declared at the top level (to avoid React hook order errors)
  const { data: profile, isLoading } = useProfile();
  const changePassword = useChangePassword();
  const updateNotifications = useUpdateNotifications();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // --------------------------
  // Conditional Rendering
  // --------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!profile || Object.keys(profile).length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        No profile data found.
      </div>
    );
  }

  // --------------------------
  // Handlers
  // --------------------------
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Password change failed:', error);
      toast.error('Failed to update password');
    }
  };

  const handleNotificationToggle = (key: string, value: boolean) => {
    const updated = { ...profile.notifications, [key]: value };
    updateNotifications.mutate({ notifications: updated });
  };

  const getInitials = (name: string) =>
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  // --------------------------
  // JSX
  // --------------------------
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.role}</p>
                {profile.department && (
                  <Badge variant="secondary" className="mt-2">
                    {profile.department}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/profile/edit')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium break-all">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{profile.phone}</span>
                </div>
              )}
              {profile.department && (
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{profile.department}</span>
                </div>
              )}
              {profile.createdAt && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined:</span>
                  <span className="font-medium">
                    {formatDate(profile.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              {/* General Info */}
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    View your profile information. Click “Edit Profile” above to
                    make changes.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={profile.name} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" defaultValue={profile.email} disabled />
                    </div>
                    {profile.phone && (
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input defaultValue={profile.phone} disabled />
                      </div>
                    )}
                    {profile.department && (
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input defaultValue={profile.department} disabled />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input defaultValue={profile.role} disabled />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Password */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Change Password</CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      {passwordData.newPassword &&
                        passwordData.confirmPassword &&
                        passwordData.newPassword !==
                          passwordData.confirmPassword && (
                          <p className="text-sm text-destructive">
                            Passwords do not match
                          </p>
                        )}
                      <Button
                        type="submit"
                        disabled={changePassword.isPending}
                        className="w-full"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {changePassword.isPending
                          ? 'Updating...'
                          : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications */}
              <TabsContent value="notifications" className="space-y-4">
                {Object.entries(profile.notifications || {}).map(
                  ([key, value]) => {
                    const labelMap: Record<string, string> = {
                      email: 'Email Notifications',
                      approvals: 'Approval Requests',
                      sla: 'SLA Breaches',
                      projects: 'Project Updates',
                      weeklyReports: 'Weekly Reports',
                    };

                    const descMap: Record<string, string> = {
                      email: 'Receive email notifications for important updates',
                      approvals: 'Notify when items need your approval',
                      sla: 'Alert when SLA targets are missed',
                      projects: 'Get notified about project milestones',
                      weeklyReports:
                        'Receive weekly summary reports via email',
                    };

                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-0.5">
                          <Label className="font-medium">
                            {labelMap[key] || key}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {descMap[key] || ''}
                          </p>
                        </div>
                        <Switch
                          checked={!!value}
                          onCheckedChange={(val) =>
                            handleNotificationToggle(key, val)
                          }
                        />
                      </div>
                    );
                  }
                )}
              </TabsContent>

              {/* Permissions */}
              <TabsContent value="permissions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Your Permissions
                    </CardTitle>
                    <CardDescription>
                      Permissions granted to your role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profile.permissions && profile.permissions.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {profile.permissions.map((perm: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-3 border rounded-lg"
                          >
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-sm">
                              {perm.module}: {perm.actions.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No permissions assigned.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
