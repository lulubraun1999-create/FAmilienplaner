'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Moon, Sun, Download } from 'lucide-react';
import type { FamilyMember, Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { exportCalendar } from '@/app/actions';
import { useState } from 'react';

interface AppHeaderProps {
  groupName: string;
  groupMembers: FamilyMember[];
  onAddEvent: () => void;
  eventsToSync: Event[];
}

export default function AppHeader({ groupName, groupMembers, onAddEvent, eventsToSync }: AppHeaderProps) {
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    toast({
      title: 'Kalender wird exportiert...',
      description: 'Deine Termine werden in eine .ics-Datei umgewandelt.',
    });
    try {
      const icalData = await exportCalendar(eventsToSync, groupName);
      
      const blob = new Blob([icalData], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `familienkalender_${groupName.toLowerCase().replace(/ /g, '_')}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export erfolgreich!',
        description: 'Die Kalender-Datei wurde heruntergeladen.',
      });

    } catch (error) {
      console.error("Failed to export calendar", error);
      toast({
        title: 'Export fehlgeschlagen',
        description: 'Beim Erstellen der Kalender-Datei ist ein Fehler aufgetreten.',
        variant: 'destructive',
      });
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <>
      <header className="flex h-20 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-bold">{groupName}</h2>
          <div className="mt-1 flex items-center">
            {groupMembers.map((member) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-card">
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            <span className="sr-only">Kalender exportieren</span>
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
          <Button onClick={onAddEvent}>
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Ereignis erstellen
          </Button>
        </div>
      </header>
    </>
  );
}
