import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChangePassword } from '@/lib/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Clock,
  Edit,
  Key,
  Bell
} from 'lucide-react';
import { formatDate } from '@/lib/utils/format';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const changePassword = useChangePassword();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return;
    }
    await changePassword.mutateAsync({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Mock additional user data
  const userData = {
    ...user,
    phone: '+91 98765 43210',
    department: 'Project Management',
    employeeId: 'EMP-001',
    joinDate: '2023-01-15',
    lastLogin: '2024-01-25T10:30:00',
    permissions: [
      'View Projects',
      'Create MRs',
      'Approve POs',
      'Manage Contractors',
      'View Reports',
    ],
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
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
                <AvatarImage src={userData.avatarUrl} alt={userData.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(userData.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{userData.name}</h3>
                <p className="text-sm text-muted-foreground">{userData.role}</p>
                <Badge variant="secondary" className="mt-2">
                  {userData.department}
                </Badge>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/profile/edit')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ID:</span>
                <span className="font-medium">{userData.employeeId}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-xs">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{userData.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{userData.department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-medium">{formatDate(userData.joinDate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    View your profile information. Click "Edit Profile" above to make changes.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input defaultValue={userData.name} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input defaultValue={userData.employeeId} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" defaultValue={userData.email} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue={userData.phone} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input defaultValue={userData.department} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input defaultValue={userData.role} disabled />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                      {passwordData.newPassword && passwordData.confirmPassword && 
                       passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-sm text-destructive">Passwords do not match</p>
                      )}
                      <Button type="submit" disabled={changePassword.isPending}>
                        <Key className="h-4 w-4 mr-2" />
                        {changePassword.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Session Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Login:</span>
                      <span className="font-medium">{formatDate(userData.lastLogin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session Status:</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Login Time:</span>
                      <span className="font-medium">{formatDate(new Date().toISOString())}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <Label className="font-medium">Email Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Approval Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify when items need your approval
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="font-medium">SLA Breaches</Label>
                      <p className="text-sm text-muted-foreground">
                        Alert when SLA targets are missed
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Project Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about project milestones
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="font-medium">Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summary reports via email
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </TabsContent>

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
                    <div className="grid grid-cols-2 gap-3">
                      {userData.permissions.map((permission, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 border rounded-lg"
                        >
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Contact your administrator to request additional permissions.
                    </p>
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
