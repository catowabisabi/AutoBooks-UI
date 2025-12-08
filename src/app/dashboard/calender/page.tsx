'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { AIAssistantCard } from '@/components/ai/ai-assistant-card';

// Demo calendar data
const demoEvents = [
  { id: '1', title: 'Team Standup', time: '09:00 AM', duration: '30 min', type: 'meeting' },
  { id: '2', title: 'Client Review', time: '11:00 AM', duration: '1 hour', type: 'client' },
  { id: '3', title: 'Lunch Break', time: '12:30 PM', duration: '1 hour', type: 'personal' },
  { id: '4', title: 'Sprint Planning', time: '02:00 PM', duration: '2 hours', type: 'meeting' },
  { id: '5', title: 'Code Review', time: '04:30 PM', duration: '30 min', type: 'work' },
];

const getEventColor = (type: string) => {
  switch (type) {
    case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'client': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'personal': return 'bg-green-100 text-green-800 border-green-200';
    case 'work': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return null;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const goToPrevDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  };

  const goToNextDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className='flex flex-1 flex-col space-y-4 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold flex items-center gap-2'>
          <CalendarIcon className='h-6 w-6' />
          Calendar
        </h1>
        <Button size='sm' className='gap-2'>
          <Plus className='h-4 w-4' />
          New Event
        </Button>
      </div>

      {/* AI Assistant Card */}
      <AIAssistantCard
        module="calendar"
        title="Calendar AI Assistant"
        description="Analyze your schedule, find free time, and optimize meetings"
        contextData={{
          currentDate: formatDate(currentDate),
          totalEvents: demoEvents.length,
          meetings: demoEvents.filter(e => e.type === 'meeting').length,
          events: demoEvents,
        }}
        defaultCollapsed={true}
        className="w-full"
      />

      {/* Date Navigation */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='icon' onClick={goToPrevDay}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button variant='outline' size='sm' onClick={goToToday}>
              Today
            </Button>
            <Button variant='outline' size='icon' onClick={goToNextDay}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
          <CardTitle className='text-lg'>{formatDate(currentDate)}</CardTitle>
        </CardHeader>
      </Card>

      {/* Events for the Day */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-base'>Today's Schedule</CardTitle>
            <CardDescription>{demoEvents.length} events scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className='h-[400px]'>
              <div className='space-y-3'>
                {demoEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${getEventColor(event.type)}`}
                  >
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium'>{event.title}</h4>
                      <Badge variant='outline' className='text-xs'>
                        {event.type}
                      </Badge>
                    </div>
                    <div className='flex items-center gap-2 mt-2 text-sm opacity-80'>
                      <Clock className='h-3 w-3' />
                      <span>{event.time}</span>
                      <span>•</span>
                      <span>{event.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Day Summary</CardTitle>
            <CardDescription>Quick overview</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Total Events</span>
              <Badge>{demoEvents.length}</Badge>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Meetings</span>
              <Badge variant='secondary'>
                {demoEvents.filter(e => e.type === 'meeting').length}
              </Badge>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Client Calls</span>
              <Badge variant='outline'>
                {demoEvents.filter(e => e.type === 'client').length}
              </Badge>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground'>Focus Time</span>
              <Badge className='bg-green-500'>2 hours</Badge>
            </div>
            <div className='pt-4 border-t'>
              <p className='text-sm text-muted-foreground'>
                💡 You have 2 hours of unscheduled time today. Consider blocking time for deep work.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
