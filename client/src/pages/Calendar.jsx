import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Plus } from 'lucide-react';
import api from '../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'custom' });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => api.get('/events').then(res => res.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/events', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      setIsModalOpen(false);
      setNewEvent({ title: '', date: '', type: 'custom' });
    }
  });

  const formattedEvents = events?.map(e => ({
    id: e._id,
    title: e.title,
    start: new Date(e.date),
    end: new Date(e.date),
    type: e.type,
  })) || [];

  const handleSelectSlot = (slotInfo) => {
    setNewEvent({ ...newEvent, date: format(slotInfo.start, "yyyy-MM-dd'T'HH:mm") });
    setIsModalOpen(true);
  };

  const handleSaveEvent = () => {
    if (newEvent.title && newEvent.date) {
      createMutation.mutate(newEvent);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6'; // custom (blue)
    if (event.type === 'deadline') backgroundColor = '#ef4444'; // red
    if (event.type === 'invoice') backgroundColor = '#f59e0b'; // amber
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">Manage your deadlines and events.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-8 text-center">Loading calendar...</div>
          ) : (
            <div className="h-[600px]">
              <BigCalendar
                localizer={localizer}
                events={formattedEvents}
                startAccessor="start"
                endAccessor="end"
                selectable
                date={currentDate}
                view={currentView}
                onNavigate={(newDate) => setCurrentDate(newDate)}
                onView={(newView) => setCurrentView(newView)}
                onSelectSlot={handleSelectSlot}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Basic Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-sm shadow-lg">
            <CardHeader>
              <CardTitle>Add Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newEvent.type} 
                  onChange={e => setNewEvent({...newEvent, type: e.target.value})}
                >
                  <option value="custom">Custom</option>
                  <option value="deadline">Deadline</option>
                  <option value="invoice">Invoice</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEvent} disabled={createMutation.isPending}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Calendar;
