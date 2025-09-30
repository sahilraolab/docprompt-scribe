import { useState } from 'react';
import { useNotifications, useMarkNotificationRead } from '@/lib/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Bell, Check, Info, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

export default function NotificationsList() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications?.filter(n => 
    filter === 'all' || !n.read
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'Success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'Approval': return <Bell className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {notifications?.filter(n => !n.read).length ? (
              <Badge variant="secondary" className="ml-2">
                {notifications.filter(n => !n.read).length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <Card 
                  key={notif.id}
                  className={`cursor-pointer transition-colors ${
                    !notif.read ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => {
                    if (notif.actionUrl) navigate(notif.actionUrl);
                    if (!notif.read) markRead.mutate(notif.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold">{notif.title}</h3>
                          {!notif.read && (
                            <Badge variant="default" className="ml-2">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead.mutate(notif.id);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
              title="No notifications"
              description={
                filter === 'unread'
                  ? "You're all caught up! No unread notifications"
                  : "You don't have any notifications yet"
              }
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
