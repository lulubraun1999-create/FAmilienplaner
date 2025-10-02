'use client';

import React, { useState, useMemo, useEffect } from 'react';
import AppSidebar from './layout/app-sidebar';
import AppHeader from './layout/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ListTodo, ShoppingCart, Dog } from 'lucide-react';
import CalendarView from './calendar-view';
import TaskList from './task-list';
import ShoppingList from './shopping-list';
import DogPlan from './dog-plan';
import { initialFamilyMembers, initialEvents, initialTasks, initialShoppingListItems, initialDogPlanItems, initialLocations, calendarGroups } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember, DogPlanItem, Location } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import EventDialog from './event-dialog';
import { Button } from './ui/button';
import WeekView from './week-view';
import DayView from './day-view';

type CalendarViewType = 'month' | 'week' | 'day';

export default function Dashboard() {
  const [selectedCalendarId, setSelectedCalendarId] = useState('all');
  const { firestore } = useFirebase();
  const familyName = 'Familie-Butz-Braun';

  // State for dialogs
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [isDataPopulated, setIsDataPopulated] = useState(false);

  // Calendar view state
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());


  const eventsRef = useMemoFirebase(() => firestore ? collection(firestore, `families/${familyName}/events`) : null, [firestore, familyName]);
  const tasksRef = useMemoFirebase(() => firestore ? collection(firestore, `families/${familyName}/tasks`) : null, [firestore, familyName]);
  const shoppingListRef = useMemoFirebase(() => firestore ? collection(firestore, `families/${familyName}/shoppingListItems`) : null, [firestore, familyName]);
  const dogPlanRef = useMemoFirebase(() => firestore ? collection(firestore, `families/${familyName}/dogPlan`) : null, [firestore, familyName]);
  const locationsRef = useMemoFirebase(() => firestore ? collection(firestore, `families/${familyName}/locations`) : null, [firestore, familyName]);

  const { data: eventsData, isLoading: eventsLoading } = useCollection<Event>(eventsRef);
  const { data: tasksData, isLoading: tasksLoading } = useCollection<Task>(tasksRef);
  const { data: shoppingListData, isLoading: shoppingLoading } = useCollection<ShoppingListItem>(shoppingListRef);
  const { data: dogPlanData, isLoading: dogPlanLoading } = useCollection<DogPlanItem>(dogPlanRef);
  const { data: locationsData, isLoading: locationsLoading } = useCollection<Location>(locationsRef);
  
    useEffect(() => {
    if (firestore && !eventsLoading && !isDataPopulated && eventsData && eventsData.length === 0) {
      const populateFirestore = async () => {
        const batch = writeBatch(firestore);

        initialEvents.forEach(event => {
          const eventRef = doc(firestore, `families/${familyName}/events`, event.id);
          batch.set(eventRef, event);
        });

        initialTasks.forEach(task => {
          const taskRef = doc(firestore, `families/${familyName}/tasks`, task.id);
          batch.set(taskRef, task);
        });
        
        initialShoppingListItems.forEach(item => {
            const itemRef = doc(firestore, `families/${familyName}/shoppingListItems`, item.id);
            batch.set(itemRef, item);
        });

        initialDogPlanItems.forEach(item => {
            const itemRef = doc(firestore, `families/${familyName}/dogPlan`, item.id);
            batch.set(itemRef, item);
        });

        initialLocations.forEach(location => {
            const locationRef = doc(firestore, `families/${familyName}/locations`, location.id);
            batch.set(locationRef, location);
        });

        await batch.commit();
        setIsDataPopulated(true);
      };

      populateFirestore().catch(console.error);
    }
  }, [firestore, eventsLoading, isDataPopulated, eventsData, familyName]);


  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  
  const localEvents = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.map(e => ({...e, start: (e.start as any).toDate(), end: (e.end as any).toDate() }));
  }, [eventsData]);

  const localTasks = useMemo(() => {
    if (!tasksData) return [];
    return tasksData.map(t => ({...t, dueDate: (t.dueDate as any).toDate()}));
  }, [tasksData]);
  
  const localShoppingItems = useMemo(() => shoppingListData || [], [shoppingListData]);
  const localDogPlanItems = useMemo(() => dogPlanData || [], [dogPlanData]);
  const localLocations = useMemo(() => locationsData || [], [locationsData]);


  const handleOpenEventDialog = (event?: Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const handleSaveEvent = (eventData: Omit<Event, 'id'> | Event) => {
    if ('id' in eventData && eventData.id) {
      // Update existing event
      if (firestore) {
        const eventDocRef = doc(eventsRef, eventData.id);
        updateDoc(eventDocRef, eventData as any);
      }
    } else {
      // Add new event
      if (eventsRef) {
        const newEventData = { ...eventData, id: doc(eventsRef).id };
        const eventRef = doc(firestore, `families/${familyName}/events`, newEventData.id);
        addDoc(eventsRef, eventData);
      }
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (firestore) {
      const eventDocRef = doc(eventsRef, eventId);
      deleteDoc(eventDocRef);
    }
  };

  const handleAddLocation = async (newLocation: Omit<Location, 'id'>): Promise<string> => {
    if (locationsRef) {
      const docRef = await addDoc(locationsRef, newLocation);
      return docRef.id;
    }
    return '';
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
    if (selectedCalendarId === 'all') {
        return { events: localEvents, tasks: localTasks, shoppingItems: localShoppingItems, dogPlanItems: localDogPlanItems, members: familyMembers };
    }
    
    const meId = 'me'; // assuming 'me' is the current user's id

    if (selectedCalendarId === 'my_calendar') {
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
    
    const groupEvents = localEvents.filter(event => event.participants.some(p => memberIdsInGroup.has(p)));
    const groupTasks = localTasks.filter(task => memberIdsInGroup.has(task.assignedTo));
    const groupShoppingItems = localShoppingItems.filter(item => memberIdsInGroup.has(item.addedBy));
    const groupDogPlanItems = localDogPlanItems.filter(item => item.assignedTo && memberIdsInGroup.has(item.assignedTo));
    const membersInGroup = familyMembers.filter(m => memberIdsInGroup.has(m.id));

    return {
      events: groupEvents,
      tasks: groupTasks,
      shoppingItems: groupShoppingItems,
      dogPlanItems: groupDogPlanItems,
      members: membersInGroup
    };
  }, [selectedCalendarId, currentGroup, localEvents, localTasks, localShoppingItems, localDogPlanItems, familyMembers]);


  return (
    <>
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
            onAddEvent={() => handleOpenEventDialog()}
            locations={localLocations}
            onAddLocation={handleAddLocation}
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
                 <div className="mb-4 flex items-center justify-end gap-2">
                    <Button variant={calendarView === 'month' ? 'default' : 'outline'} onClick={() => setCalendarView('month')}>Monat</Button>
                    <Button variant={calendarView === 'week' ? 'default' : 'outline'} onClick={() => setCalendarView('week')}>Woche</Button>
                    <Button variant={calendarView === 'day' ? 'default' : 'outline'} onClick={() => setCalendarView('day')}>Tag</Button>
                </div>
                 {calendarView === 'month' && (
                    <CalendarView 
                        events={filteredData.events} 
                        locations={localLocations} 
                        onEventClick={handleOpenEventDialog}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        onDayClick={(day) => {
                            setCurrentDate(day);
                            setCalendarView('day');
                        }}
                    />
                 )}
                 {calendarView === 'week' && (
                    <WeekView 
                        events={filteredData.events} 
                        locations={localLocations} 
                        onEventClick={handleOpenEventDialog}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                         onDayClick={(day) => {
                            setCurrentDate(day);
                            setCalendarView('day');
                        }}
                    />
                 )}
                  {calendarView === 'day' && (
                    <DayView 
                        events={filteredData.events} 
                        locations={localLocations} 
                        onEventClick={handleOpenEventDialog}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                    />
                 )}
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
      <EventDialog
        isOpen={isEventDialogOpen}
        setIsOpen={setIsEventDialogOpen}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        allFamilyMembers={familyMembers}
        calendarGroups={[{id: 'all', name: 'Alle', members: familyMembers.map(m => m.id)}, ...calendarGroups]}
        locations={localLocations}
        onAddLocation={handleAddLocation}
      />
    </>
  );
}
