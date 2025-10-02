'use client';

import { cn } from '@/lib/utils';
import { CalendarDays, Users, User, LogOut } from 'lucide-react';
import type { CalendarGroup } from '@/lib/types';
import { familyMembers } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AppSidebarProps {
  calendarGroups: CalendarGroup[];
  selectedCalendarId: string;
  onCalendarChange: (id: string) => void;
}

export default function AppSidebar({ calendarGroups, selectedCalendarId, onCalendarChange }: AppSidebarProps) {
  const me = familyMembers.find(m => m.id === 'me');

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-2xl font-bold">Familienplaner</h1>
      </div>

      <nav className="mt-8 flex-1">
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Kalender</h2>
        <ul>
          <li>
            <button
              onClick={() => onCalendarChange('all')}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-secondary',
                selectedCalendarId === 'all' && 'bg-secondary'
              )}
            >
              <Users className="h-4 w-4" />
              Gesamte Familie
            </button>
          </li>
           <li>
            <button
              onClick={() => onCalendarChange('my_calendar')}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-secondary',
                selectedCalendarId === 'my_calendar' && 'bg-secondary'
              )}
            >
              <User className="h-4 w-4" />
              Mein Kalender
            </button>
          </li>
          {calendarGroups.map((group) => (
            <li key={group.id}>
              <button
                onClick={() => onCalendarChange(group.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-secondary',
                  selectedCalendarId === group.id && 'bg-secondary'
                )}
              >
                <div className="h-4 w-4 flex items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                </div>
                {group.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3">
            {me && (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={me.avatar.imageUrl} alt={me.name} data-ai-hint={me.avatar.imageHint} />
                    <AvatarFallback>{me.name.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className="flex-1">
                <p className="text-sm font-semibold">{me?.name}</p>
                <p className="text-xs text-muted-foreground">Mein Profil</p>
            </div>
            <button className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <LogOut className="h-5 w-5" />
            </button>
        </div>
      </div>
    </aside>
  );
}
