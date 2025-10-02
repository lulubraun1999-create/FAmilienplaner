'use client';

import React from 'react';
import {
  format,
  add,
  isToday,
  isWithinInterval,
  startOfDay,
  endOfDay,
  isSameDay,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import type { Event, Location, FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';

interface DayViewProps {
  events: Event[];
  locations: Location[];
  familyMembers: FamilyMember[];
  onEventClick: (event: Event) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export default function DayView({ events, locations, familyMembers, onEventClick, currentDate, setCurrentDate }: DayViewProps) {

  const nextDay = () => {
    setCurrentDate(add(currentDate, { days: 1 }));
  };

  const prevDay = () => {
    setCurrentDate(add(currentDate, { days: -1 }));
  };
  
  const dayStart = startOfDay(currentDate);
  const dayEnd = endOfDay(currentDate);

  const dayEventsRaw = events.filter(event => 
      isWithinInterval(currentDate, { 
          start: startOfDay(new Date(event.start.toString())), 
          end: endOfDay(new Date(event.end.toString())) 
      })
  );

  const allDayEvents = dayEventsRaw.filter(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      // It's an all-day event if the flag is set OR if it spans more than one day and this is a middle day
      return event.allDay || (!isSameDay(eventStart, dayStart) && !isSameDay(eventEnd, dayStart));
  });

  const timedEvents = dayEventsRaw
    .filter(event => !allDayEvents.includes(event))
    .sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());


  const getLocationById = (locationId: string) => {
    return locations.find(location => location.id === locationId);
  }

  const getMemberColor = (userId: string) => {
    return familyMembers.find(m => m.id === userId)?.color;
  };


  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-bold capitalize">
            {format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </h2>
            <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevDay}>
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay}>
                <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
        </div>

        {allDayEvents.length > 0 && (
            <div className='border rounded-lg p-2 mb-4'>
                 <h3 className='text-sm font-semibold mb-2 text-center'>Ganztägige Termine</h3>
                 <div className='space-y-1'>
                    {allDayEvents.map(event => (
                         <button
                            key={event.id}
                            className='w-full text-left'
                            onClick={() => onEventClick(event)}
                        >
                            <Badge className='w-full truncate text-xs flex items-center justify-start gap-2 cursor-pointer border-l-4' variant='secondary' style={{ borderColor: getMemberColor(event.createdBy) }}>
                               <span className='truncate font-bold'>{event.title}</span>
                            </Badge>
                        </button>
                    ))}
                 </div>
            </div>
        )}

        <div className='relative h-[600px] overflow-y-auto'>
            <div className='absolute inset-0'>
                {hours.map(hour => (
                    <div key={hour} className='relative flex h-16 border-t'>
                        <div className='w-16 flex-shrink-0 pr-2 text-right text-xs text-muted-foreground pt-1'>
                            {format(new Date().setHours(hour), 'HH:00')}
                        </div>
                        <div className='flex-grow border-l'></div>
                    </div>
                ))}
            </div>
             <div className='absolute inset-0 w-full'>
                {timedEvents.map(event => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    
                    const isFirstDay = isSameDay(eventStart, dayStart);
                    const isLastDay = isSameDay(eventEnd, dayStart);

                    const startMinutes = isFirstDay ? eventStart.getHours() * 60 + eventStart.getMinutes() : 0;
                    const endMinutes = isLastDay ? eventEnd.getHours() * 60 + eventEnd.getMinutes() : 24 * 60;
                    
                    const top = (startMinutes / 60) * 64; // 64px per hour
                    const height = Math.max(32, ((endMinutes - startMinutes) / 60) * 64);

                    const location = event.locationId ? getLocationById(event.locationId) : null;
                    const color = getMemberColor(event.createdBy);
                    
                    return (
                        <button
                            key={event.id}
                            className='absolute left-16 right-0 p-2 text-left rounded-lg bg-secondary text-secondary-foreground z-10 border-l-4 overflow-hidden'
                            style={{ top: `${top}px`, height: `${height}px`, borderColor: color }}
                            onClick={() => onEventClick(event)}
                        >
                        <p className='font-bold text-sm truncate'>{event.title}</p>
                        <p className='text-xs'>{format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}</p>
                        {location && <p className='text-xs flex items-center gap-1'><MapPin className='h-3 w-3' />{location.name}</p>}
                        </button>
                    )
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}