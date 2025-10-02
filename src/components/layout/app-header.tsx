'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus, Bell, RefreshCw } from 'lucide-react';
import type { FamilyMember, Event } from '@/lib/types';
import EventDialog from '../event-dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AppHeaderProps {
  groupName: string;
  groupMembers: FamilyMember[];
  onAddEvent: (event: Omit<Event, 'id' | 'calendarId'>) => void;
}

export default function AppHeader({ groupName, groupMembers, onAddEvent }: AppHeaderProps) {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const { toast } = useToast();

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
        participants={groupMembers}
      />
    </>
  );
}
