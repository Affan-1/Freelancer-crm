import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const Notifications = () => {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(res => res.data.data),
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">View your recent alerts and updates.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Loading notifications...</div>
          ) : (
            <div className="space-y-4">
              {notifications?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No new notifications.</p>
              ) : (
                notifications?.map(note => (
                  <div key={note._id} className={`p-4 rounded-lg border ${note.isRead ? 'bg-background' : 'bg-primary/5 border-primary/20'}`}>
                    <p className="font-medium text-sm">{note.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
