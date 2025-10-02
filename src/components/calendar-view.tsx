'use client';

import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  getISOWeek,
  add,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import type { Event, Location, FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


interface CalendarViewProps {
  events: Event[];
  locations: Location[];
  familyMembers: FamilyMember[];
  onEventClick: (event: Event) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onDayClick: (date: Date) => void;
}

export default function CalendarView({ events, locations, familyMembers, onEventClick, currentDate, setCurrentDate, onDayClick }: CalendarViewProps) {
  const firstDayOfMonth = startOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth, { locale: de }),
    end: endOfWeek(endOfMonth(firstDayOfMonth), { locale: de }),
  });

  const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  const nextMonth = () => {
    setCurrentDate(add(firstDayOfMonth, { months: 1 }));
  };

  const prevMonth = () => {
    setCurrentDate(add(firstDayOfMonth, { months: -1 }));
  };
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
        isWithinInterval(day, { 
            start: startOfDay(new Date(event.start.toString())), 
            end: endOfDay(new Date(event.end.toString())) 
        })
    );
  }
  
  const getLocationById = (locationId: string) => {
    return locations.find(location => location.id === locationId);
  }

  const getMemberColor = (userId: string) => {
    return familyMembers.find(m => m.id === userId)?.color;
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-bold capitalize">{format(currentDate, 'MMMM yyyy', { locale: de })}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <TooltipProvider>
        <div className="grid grid-cols-[auto_1fr] gap-px border-t border-l bg-border">
          {/* Empty corner */}
          <div className="bg-card"></div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-px">
            {weekdays.map((day) => (
                <div key={day} className="bg-card py-2 text-center text-sm font-medium text-muted-foreground">
                {day}
                </div>
            ))}
          </div>

          {/* Week numbers and Day cells */}
          {Array.from({ length: Math.ceil(daysInMonth.length / 7) }).map((_, weekIndex) => {
            const weekDays = daysInMonth.slice(weekIndex * 7, (weekIndex + 1) * 7);
            if (weekDays.length === 0) return null;
            const weekNumber = getISOWeek(weekDays[0]);

            return (
              <React.Fragment key={weekIndex}>
                <div className="flex items-center justify-center bg-card p-2 text-xs font-medium text-muted-foreground">
                  KW{weekNumber}
                </div>
                <div className="grid grid-cols-7 gap-px">
                  {weekDays.map((day, dayIndex) => (
                     <div key={dayIndex} className={cn("relative min-h-[120px] bg-card p-2", !isSameMonth(day, currentDate) && 'bg-background')}>
                        <button className='w-full text-left' onClick={() => onDayClick(day)}>
                            <time dateTime={format(day, 'yyyy-MM-dd')} className={cn('text-sm', isToday(day) && 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground')}>
                                {format(day, 'd')}
                            </time>
                        </button>
                        <div className='mt-2 space-y-1'>
                            {getEventsForDay(day).slice(0, 3).map(event => {
                                const location = event.locationId ? getLocationById(event.locationId) : null;
                                const eventStart = new Date(event.start);
                                const eventEnd = new Date(event.end);
                                const isFirstDay = isSameDay(eventStart, day);
                                const isLastDay = isSameDay(eventEnd, day);

                                const badgeStyle = cn(
                                    'w-full truncate text-xs flex items-center justify-start gap-2 cursor-pointer border-l-4',
                                    {
                                        'rounded-r-none': !isLastDay,
                                        'rounded-l-none': !isFirstDay,
                                    }
                                );
                                
                                return (
                                    <Tooltip key={event.id}>
                                    <TooltipTrigger asChild>
                                        <button className='w-full text-left' onClick={() => onEventClick(event)}>
                                            <Badge className={badgeStyle} variant='secondary' style={{ borderColor: getMemberColor(event.createdBy) }}>
                                            {isFirstDay && !event.allDay && <span>{format(eventStart, 'HH:mm')}</span>}
                                            <span className='truncate'>{event.title}</span>
                                            {location && <MapPin className="h-3 w-3 flex-shrink-0" />}
                                            </Badge>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className='font-bold'>{event.title}</p>
                                        <p>{format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}</p>
                                        {location && <p className='text-muted-foreground'>{location.name}: {location.street} {location.housenumber}, {location.postalcode} {location.city}</p>}
                                        {event.description && <p className='text-sm italic mt-1'>{event.description}</p>}
                                        <p className='text-xs text-muted-foreground mt-2'>Klicken zum Bearbeiten</p>
                                    </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                            {getEventsForDay(day).length > 3 && (
                                <p className='text-xs text-muted-foreground'>+ {getEventsForDay(day).length - 3} more</p>
                            )}
                        </div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
