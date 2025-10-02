'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { SidebarContent } from './app-sidebar';
import type { CalendarGroup, FamilyMember } from '@/lib/types';


interface MobileSidebarProps {
  calendarGroups: CalendarGroup[];
  selectedCalendarId: string;
  onCalendarChange: (id: string) => void;
  familyMembers: FamilyMember[];
  onUpdateProfile: (member: FamilyMember) => void;
  me: FamilyMember | undefined;
}

export default function MobileSidebar(props: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Menü öffnen</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SidebarContent {...props} onLinkClick={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
