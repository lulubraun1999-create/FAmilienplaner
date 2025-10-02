'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Users, User, LogOut } from 'lucide-react';
import type { CalendarGroup, FamilyMember } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ProfileDialog from '../profile-dialog';
import { getInitials } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AppSidebarProps {
  calendarGroups: CalendarGroup[];
  selectedCalendarId: string;
  onCalendarChange: (id: string) => void;
  familyMembers: FamilyMember[];
  onUpdateProfile: (member: FamilyMember) => void;
  me: FamilyMember | undefined;
}

export default function AppSidebar({ calendarGroups, selectedCalendarId, onCalendarChange, familyMembers, onUpdateProfile, me }: AppSidebarProps) {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  const displayName = me?.name || user?.displayName || "Profil";


  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          <h1 className="font-headline text-2xl font-bold">Vierklang</h1>
        </div>

        <nav className="mt-8 flex-1">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Kalender</h2>
          <ul>
            <li>
              <button
                onClick={() => onCalendarChange('all')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-secondary',
                  selectedCalendarId === 'all' && 'bg-primary/20 text-primary-foreground'
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

        <div className="mt-auto space-y-2">
          <button className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary" onClick={() => setIsProfileDialogOpen(true)}>
              {me && (
                  <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
              )}
              <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Mein Profil</p>
              </div>
          </button>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg p-2 transition-colors text-muted-foreground hover:bg-secondary hover:text-destructive">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Abmelden</span>
          </button>
        </div>
      </aside>
      {me && (
        <ProfileDialog 
          isOpen={isProfileDialogOpen}
          setIsOpen={setIsProfileDialogOpen}
          member={me}
          onSave={onUpdateProfile}
        />
      )}
    </>
  );
}
