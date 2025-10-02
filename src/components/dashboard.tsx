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
import { calendarGroups, events, familyMembers, shoppingListItems, tasks, dogPlanItems } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember, DogPlanItem } from '@/lib/types';

export default function Dashboard() {
  const [selectedCalendarId, setSelectedCalendarId] = useState('all');

  const [localEvents, setLocalEvents] = useState<Event[]>(events);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [localShoppingItems, setLocalShoppingItems] = useState<ShoppingListItem[]>(shoppingListItems);
  const [localDogPlanItems, setLocalDogPlanItems] = useState<DogPlanItem[]>(dogPlanItems);

  const handleAddEvent = (newEvent: Omit<Event, 'id' | 'calendarId'>) => {
    const newEventWithId: Event = {
      ...newEvent,
      id: `e${Date.now()}`,
      calendarId: selectedCalendarId === 'all' || selectedCalendarId === 'my_calendar' ? 'c_immediate' : selectedCalendarId,
    };
    setLocalEvents(prev => [...prev, newEventWithId]);
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
  }, [selectedCalendarId]);

  const filteredData = useMemo(() => {
    if (selectedCalendarId === 'all') {
      return {
        events: localEvents,
        tasks: localTasks,
        shoppingItems: localShoppingItems,
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
    const filteredDogPlanItems = localDogPlanItems.filter(item => item.calendarId === selectedCalendarId);

    const membersInGroup = familyMembers.filter(m => memberIdsInGroup.has(m.id));

    return {
      events: filteredEvents,
      tasks: filteredTasks,
      shoppingItems: filteredShoppingItems,
      dogPlanItems: filteredDogPlanItems,
      members: membersInGroup
    };
  }, [selectedCalendarId, currentGroup, localEvents, localTasks, localShoppingItems, localDogPlanItems]);


  return (
    <div className="flex h-screen w-full bg-background font-body text-foreground">
      <AppSidebar
        calendarGroups={calendarGroups}
        selectedCalendarId={selectedCalendarId}
        onCalendarChange={setSelectedCalendarId}
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
