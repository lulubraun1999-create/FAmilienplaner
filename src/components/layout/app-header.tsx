'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Bell, RefreshCw, Moon, Sun } from 'lucide-react';
import type { FamilyMember, Event, CalendarGroup, Location } from '@/lib/types';
import EventDialog from '../event-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { calendarGroups, initialFamilyMembers } from '@/lib/data';

interface AppHeaderProps {
  groupName: string;
  groupMembers: FamilyMember[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  locations: Location[];
  onAddLocation: (location: Omit<Location, 'id'>) => Promise<string>;
}

export default function AppHeader({ groupName, groupMembers, onAddEvent, locations, onAddLocation }: AppHeaderProps) {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const { toast } = useToast();
  const { setTheme } = useTheme();

  const handleSync = () => {
    toast({
      title: 'Synchronisierung gestartet',
      description: 'Deine Kalender werden jetzt synchronisiert.',
    });
  };

  return (
    <>
      <header className="flex h-20 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-bold">{groupName}</h2>
          <div className="mt-1 flex items-center -space-x-2">
            {groupMembers.map((member) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-card">
                <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={handleSync}>
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Synchronisieren</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Benachrichtigungen</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Hell
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dunkel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsEventDialogOpen(true)}>
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Ereignis erstellen
          </Button>
        </div>
      </header>
      <EventDialog
        isOpen={isEventDialogOpen}
        setIsOpen={setIsEventDialogOpen}
        onSave={onAddEvent}
        allFamilyMembers={initialFamilyMembers}
        calendarGroups={[{id: 'all', name: 'Alle', members: initialFamilyMembers.map(m => m.id)}, ...calendarGroups]}
        locations={locations}
        onAddLocation={onAddLocation}
      />
    </>
  );
}
