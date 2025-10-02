'use client';

import React from 'react';
import {
  format,
  add,
  isToday,
  isSameDay,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { Button } from './ui/button';
import type { Event, Location, FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

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

  const dayEvents = events
    .filter(event => isSameDay(new Date(event.start.toString()), currentDate))
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
        <div className='relative h-[600px] overflow-y-auto'>
            {hours.map(hour => (
                <div key={hour} className='relative flex h-16 border-t'>
                    <div className='w-16 flex-shrink-0 pr-2 text-right text-xs text-muted-foreground'>
                        {format(new Date().setHours(hour), 'HH:00')}
                    </div>
                    <div className='flex-grow border-l'></div>
                </div>
            ))}
            {dayEvents.map(event => {
                const top = (new Date(event.start).getHours() * 60 + new Date(event.start).getMinutes()) / (24*60) * (24*64); // 64px per hour
                const height = Math.max(32, (new Date(event.end).getTime() - new Date(event.start).getTime()) / (1000 * 60) / 60 * 64);
                const location = event.locationId ? getLocationById(event.locationId) : null;
                const color = getMemberColor(event.createdBy);
                
                return (
                    <button
                        key={event.id}
                        className='absolute left-16 right-0 p-2 text-left rounded-lg bg-secondary text-secondary-foreground z-10 border-l-4'
                        style={{ top: `${top}px`, height: `${height}px`, borderColor: color }}
                        onClick={() => onEventClick(event)}
                    >
                       <p className='font-bold text-sm'>{event.title}</p>
                       <p className='text-xs'>{format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}</p>
                       {location && <p className='text-xs flex items-center gap-1'><MapPin className='h-3 w-3' />{location.name}</p>}
                    </button>
                )
            })}
        </div>
      </CardContent>
    </Card>
  );
}