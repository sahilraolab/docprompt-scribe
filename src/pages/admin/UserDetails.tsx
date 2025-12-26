import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@/lib/hooks/useAdminModule';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/format';
import { groupPermissionsByModule, MODULE_LABELS, ACTION_LABELS } from '@/lib/utils/permissions';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
        <Button onClick={() => navigate('/admin/users')} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  // Get role name
  const getRoleName = () => {
    if (!user.role) return 'No Role';
    return typeof user.role === 'object' ? user.role.name : user.role;
  };

  // Get grouped permissions
  const permissions = groupPermissionsByModule(user.permissions || []);

  // Get initials for avatar
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Details</h1>
            <p className="text-muted-foreground">
              View user information
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/admin/users/${id}/edit`)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{getRoleName()}</p>
            <Badge variant={user.isActive ? 'default' : 'secondary'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone || 'N/A'}
            </p>
            <p>
              <strong>Role:</strong> {getRoleName()}
            </p>
            <p>
              <strong>Created:</strong> {formatDateTime(user.createdAt)}
            </p>
            <p>
              <strong>Updated:</strong> {formatDateTime(user.updatedAt)}
            </p>
          </CardContent>
        </Card>

        {/* Permissions */}
        {Object.keys(permissions).length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(permissions).map(([module, actions]) => (
                  <div
                    key={module}
                    className="border rounded-lg p-3"
                  >
                    <p className="font-semibold text-sm mb-1">
                      {MODULE_LABELS[module] || module}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {actions.map((a) => ACTION_LABELS[a] || a).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
