'use client';

import React, { useState, useMemo } from 'react';
import AppSidebar from './layout/app-sidebar';
import AppHeader from './layout/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ListTodo, ShoppingCart, Dog } from 'lucide-react';
import CalendarView from './calendar-view';
import TaskList from './task-list';
import ShoppingList from './shopping-list';
import DogPlan from './dog-plan';
import { calendarGroups, initialEvents, initialFamilyMembers, initialShoppingListItems, initialTasks, initialDogPlanItems } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember, DogPlanItem } from '@/lib/types';

export default function Dashboard() {
  const [selectedCalendarId, setSelectedCalendarId] = useState('all');

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [localEvents, setLocalEvents] = useState<Event[]>(initialEvents);
  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks);
  const [localShoppingItems, setLocalShoppingItems] = useState<ShoppingListItem[]>(initialShoppingListItems);
  const [localDogPlanItems, setLocalDogPlanItems] = useState<DogPlanItem[]>(initialDogPlanItems);

  const handleAddEvent = (newEvent: Omit<Event, 'id' | 'calendarId'>) => {
    let calendarIdForEvent: string;

    if (selectedCalendarId === 'all' || selectedCalendarId === 'my_calendar') {
        calendarIdForEvent = 'c_all';
    } else {
        calendarIdForEvent = selectedCalendarId;
    }

    const newEventWithId: Event = {
      ...newEvent,
      id: `e${Date.now()}`,
      calendarId: calendarIdForEvent,
    };
    setLocalEvents(prev => [...prev, newEventWithId]);
  };
  
  const handleUpdateProfile = (updatedMember: FamilyMember) => {
    setFamilyMembers(prevMembers => prevMembers.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const currentGroup = useMemo(() => {
    if (selectedCalendarId === 'all') {
      return { id: 'all', name: 'Gesamte Familie', members: familyMembers.map(m => m.id) };
    }
    if (selectedCalendarId === 'my_calendar') {
      const me = familyMembers.find(m => m.id === 'me');
      return { id: 'my_calendar', name: 'Mein Kalender', members: me ? [me.id] : [] };
    }
    return calendarGroups.find(g => g.id === selectedCalendarId);
  }, [selectedCalendarId, familyMembers]);

  const filteredData = useMemo(() => {
    const allMemberIds = familyMembers.map(m => m.id);

    if (selectedCalendarId === 'all') {
        return {
            events: localEvents.filter(event => event.calendarId === 'c_all' || event.calendarId === 'c_immediate' || event.calendarId === 'c_grandparents' || event.calendarId === 'c_aunt_uncle'),
            tasks: localTasks.filter(task => task.calendarId === 'c_all' || task.calendarId === 'c_immediate' || task.calendarId === 'c_grandparents' || task.calendarId === 'c_aunt_uncle'),
            shoppingItems: localShoppingItems.filter(item => item.calendarId === 'c_all' || item.calendarId === 'c_immediate' || item.calendarId === 'c_grandparents' || item.calendarId === 'c_aunt_uncle'),
            dogPlanItems: localDogPlanItems,
            members: familyMembers
        };
    }

    if (selectedCalendarId === 'my_calendar') {
        const meId = 'me';
        const myEvents = localEvents.filter(event => event.participants.includes(meId));
        const myTasks = localTasks.filter(task => task.assignedTo === meId);
        const myShoppingItems = localShoppingItems.filter(item => item.addedBy === meId);
        const myDogPlanItems = localDogPlanItems.filter(item => item.assignedTo === meId);
        const meMember = familyMembers.find(m => m.id === meId);

        return {
            events: myEvents,
            tasks: myTasks,
            shoppingItems: myShoppingItems,
            dogPlanItems: myDogPlanItems,
            members: meMember ? [meMember] : []
        };
    }

    const memberIdsInGroup = new Set(currentGroup?.members);

    const filteredEvents = localEvents.filter(event => event.calendarId === selectedCalendarId);
    const filteredTasks = localTasks.filter(task => task.calendarId === selectedCalendarId);
    const filteredShoppingItems = localShoppingItems.filter(item => item.calendarId === selectedCalendarId);
    const filteredDogPlanItems = localDogPlanItems.filter(item => {
        if (!item.assignedTo) return false; // Unassigned items are not shown in specific group calendars
        return memberIdsInGroup.has(item.assignedTo);
    });

    const membersInGroup = familyMembers.filter(m => memberIdsInGroup.has(m.id));

    return {
      events: filteredEvents,
      tasks: filteredTasks,
      shoppingItems: filteredShoppingItems,
      dogPlanItems: filteredDogPlanItems,
      members: membersInGroup
    };
  }, [selectedCalendarId, currentGroup, localEvents, localTasks, localShoppingItems, localDogPlanItems, familyMembers]);


  return (
    <div className="flex h-screen w-full bg-background font-body text-foreground">
      <AppSidebar
        calendarGroups={calendarGroups}
        selectedCalendarId={selectedCalendarId}
        onCalendarChange={setSelectedCalendarId}
        familyMembers={familyMembers}
        onUpdateProfile={handleUpdateProfile}
      />
      <div className="flex flex-1 flex-col">
        <AppHeader
          groupName={currentGroup?.name || 'Familienplaner'}
          groupMembers={filteredData.members}
          onAddEvent={handleAddEvent}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Tabs defaultValue="calendar" className="h-full">
            <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid md:grid-cols-4">
              <TabsTrigger value="calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Kalender
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <ListTodo className="mr-2 h-4 w-4" />
                Aufgaben
              </TabsTrigger>
              <TabsTrigger value="shopping">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Einkaufsliste
              </TabsTrigger>
              <TabsTrigger value="dog-plan">
                <Dog className="mr-2 h-4 w-4" />
                Hundeplan
              </TabsTrigger>
            </TabsList>
            <TabsContent value="calendar" className="mt-4 rounded-lg">
              <CalendarView events={filteredData.events} />
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <TaskList tasks={filteredData.tasks} members={familyMembers} />
            </TabsContent>
            <TabsContent value="shopping" className="mt-4">
              <ShoppingList items={filteredData.shoppingItems} members={familyMembers} />
            </TabsContent>
            <TabsContent value="dog-plan" className="mt-4">
              <DogPlan items={filteredData.dogPlanItems} members={familyMembers} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
