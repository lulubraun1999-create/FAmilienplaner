'use client';

import React, { useState, useMemo } from 'react';
import AppSidebar from './layout/app-sidebar';
import AppHeader from './layout/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ListTodo, ShoppingCart } from 'lucide-react';
import CalendarView from './calendar-view';
import TaskList from './task-list';
import ShoppingList from './shopping-list';
import { calendarGroups, events, familyMembers, shoppingListItems, tasks } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember } from '@/lib/types';

export default function Dashboard() {
  const [selectedCalendarId, setSelectedCalendarId] = useState('all');

  const [localEvents, setLocalEvents] = useState<Event[]>(events);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [localShoppingItems, setLocalShoppingItems] = useState<ShoppingListItem[]>(shoppingListItems);

  const handleAddEvent = (newEvent: Omit<Event, 'id' | 'calendarId'>) => {
    const newEventWithId: Event = {
      ...newEvent,
      id: `e${Date.now()}`,
      calendarId: selectedCalendarId === 'all' ? 'c_immediate' : selectedCalendarId,
    };
    setLocalEvents(prev => [...prev, newEventWithId]);
  };

  const currentGroup = useMemo(() => {
    if (selectedCalendarId === 'all') {
      return { id: 'all', name: 'Gesamte Familie', members: familyMembers.map(m => m.id) };
    }
    return calendarGroups.find(g => g.id === selectedCalendarId);
  }, [selectedCalendarId]);

  const filteredData = useMemo(() => {
    const memberIdsInGroup = new Set(currentGroup?.members);
    
    const filteredEvents = localEvents.filter(event =>
      selectedCalendarId === 'all' || event.calendarId === selectedCalendarId
    );
    
    const filteredTasks = localTasks.filter(task =>
      selectedCalendarId === 'all' || task.calendarId === selectedCalendarId
    );
    
    const filteredShoppingItems = localShoppingItems.filter(item =>
      selectedCalendarId === 'all' || item.calendarId === selectedCalendarId
    );

    const membersInGroup = familyMembers.filter(m => memberIdsInGroup.has(m.id));

    return {
      events: filteredEvents,
      tasks: filteredTasks,
      shoppingItems: filteredShoppingItems,
      members: membersInGroup
    };
  }, [selectedCalendarId, currentGroup, localEvents, localTasks, localShoppingItems]);

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
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid md:grid-cols-3">
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
          </Tabs>
        </main>
      </div>
    </div>
  );
}
