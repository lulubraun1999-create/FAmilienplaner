'use client';

import React from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  add,
  isSameDay,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import type { Event, Location } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface WeekViewProps {
  events: Event[];
  locations: Location[];
  onEventClick: (event: Event) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onDayClick: (date: Date) => void;
}

export default function WeekView({ events, locations, onEventClick, currentDate, setCurrentDate, onDayClick }: WeekViewProps) {
  const firstDayOfWeek = startOfWeek(currentDate, { locale: de });
  const lastDayOfWeek = endOfWeek(currentDate, { locale: de });
  
  const daysInWeek = eachDayOfInterval({
    start: firstDayOfWeek,
    end: lastDayOfWeek,
  });

  const nextWeek = () => {
    setCurrentDate(add(firstDayOfWeek, { weeks: 1 }));
  };

  const prevWeek = () => {
    setCurrentDate(add(firstDayOfWeek, { weeks: -1 }));
  };

  const getEventsForDay = (day: Date) => {
    return events
        .filter(event => isSameDay(new Date(event.start.toString()), day))
        .sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  const getLocationById = (locationId: string) => {
    return locations.find(location => location.id === locationId);
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-bold capitalize">
          {format(firstDayOfWeek, 'd. MMMM', { locale: de })} - {format(lastDayOfWeek, 'd. MMMM yyyy', { locale: de })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-px border-t border-l bg-border">
          {daysInWeek.map((day, i) => (
            <div key={i} className="min-h-[200px] bg-card">
              <div className={cn('p-2 text-center border-b', isToday(day) && 'bg-primary/10')}>
                 <button className='w-full text-center' onClick={() => onDayClick(day)}>
                    <p className="text-sm font-medium text-muted-foreground">{format(day, 'EEE', { locale: de })}</p>
                    <p className={cn('text-2xl font-bold', isToday(day) && 'text-primary')}>{format(day, 'd')}</p>
                </button>
              </div>
              <div className='p-2 space-y-2'>
                {getEventsForDay(day).map(event => {
                    const location = event.locationId ? getLocationById(event.locationId) : null;
                    return (
                        <Tooltip key={event.id}>
                        <TooltipTrigger asChild>
                            <button className='w-full text-left' onClick={() => onEventClick(event)}>
                                <Badge className='w-full truncate text-xs flex items-center justify-start gap-2 cursor-pointer' variant='secondary'>
                                <span>{format(new Date(event.start.toString()), 'HH:mm')}</span>
                                <span className='truncate'>{event.title}</span>
                                {location && <MapPin className="h-3 w-3 flex-shrink-0" />}
                                </Badge>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className='font-bold'>{event.title}</p>
                            <p>{format(new Date(event.start.toString()), 'HH:mm')} - {format(new Date(event.end.toString()), 'HH:mm')}</p>
                            {location && <p className='text-muted-foreground'>{location.name}: {location.street} {location.housenumber}, {location.postalcode} {location.city}</p>}
                            {event.description && <p className='text-sm italic mt-1'>{event.description}</p>}
                            <p className='text-xs text-muted-foreground mt-2'>Klicken zum Bearbeiten</p>
                        </TooltipContent>
                        </Tooltip>
                    )
                })}
                 {getEventsForDay(day).length === 0 && (
                     <p className='text-xs text-center text-muted-foreground pt-4'>Keine Termine</p>
                 )}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
