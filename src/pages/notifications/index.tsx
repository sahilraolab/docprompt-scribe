import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/format';

const mockNotifications = [
  {
    id: '1',
    type: 'Approval',
    title: 'PO Approval Required',
    message: 'Purchase Order PO-2024-001 requires your approval',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'Info',
    title: 'Project Update',
    message: 'Skyline Towers reached 45% completion',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    type: 'Success',
    title: 'WO Approved',
    message: 'Work Order WO-2024-001 has been approved',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function NotificationsIndex() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with system activities</p>
        </div>
        <Badge variant="default" className="h-6">
          2 New
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                notification.read ? 'bg-background' : 'bg-muted/50'
              } hover:bg-muted/80 transition-colors cursor-pointer`}
            >
              <div className="mt-1">
                {notification.read ? (
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Bell className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{notification.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
