import { http, HttpResponse } from 'msw';
import { notifications } from '../data/notifications';

export const notificationHandlers = [
  http.get('/api/notifications', () => {
    return HttpResponse.json({ data: notifications, total: notifications.length });
  }),

  http.patch('/api/notifications/:id/read', ({ params }) => {
    const notif = notifications.find((n) => n.id === params.id);
    if (notif) {
      notif.read = true;
    }
    return HttpResponse.json({ success: true });
  }),
];
