'use client';

import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
  isSameDay,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import type { Event } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface CalendarViewProps {
  events: Event[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(currentMonth, { locale: de }),
    end: endOfWeek(endOfMonth(currentMonth), { locale: de }),
  });

  const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-bold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: de })}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px border-t border-l bg-border">
        {weekdays.map((day) => (
          <div key={day} className="bg-card py-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {daysInMonth.map((day, i) => (
          <div key={i} className={cn("relative min-h-[120px] bg-card p-2", !isSameMonth(day, currentMonth) && 'bg-background')}>
            <time dateTime={format(day, 'yyyy-MM-dd')} className={cn('text-sm', isToday(day) && 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground')}>
              {format(day, 'd')}
            </time>
            <div className='mt-2 space-y-1'>
                {getEventsForDay(day).slice(0, 3).map(event => (
                    <div key={event.id}>
                        <Badge className='w-full truncate text-xs' variant='secondary'>
                           {format(event.start, 'HH:mm')} {event.title}
                        </Badge>
                    </div>
                ))}
                {getEventsForDay(day).length > 3 && (
                    <p className='text-xs text-muted-foreground'>+ {getEventsForDay(day).length - 3} more</p>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
