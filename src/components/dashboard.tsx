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
import { calendarGroups, initialFamilyMembers, initialEvents, initialTasks, initialShoppingListItems, initialDogPlanItems, initialLocations } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember, DogPlanItem, Location } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch, getDocs, addDoc } from 'firebase/firestore';

export default function Dashboard() {
  const [selectedCalendarId, setSelectedCalendarId] = useState('all');

  const { firestore, user } = useFirebase();

  const familyName = 'Familie-Butz-Braun'; 

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


  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [localEvents, setLocalEvents] = useState<Event[]>([]);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [localShoppingItems, setLocalShoppingItems] = useState<ShoppingListItem[]>([]);
  const [localDogPlanItems, setLocalDogPlanItems] = useState<DogPlanItem[]>([]);
  const [localLocations, setLocalLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (firestore && familyName) {
      const collections: { [key: string]: { ref: any; data: any[] } } = {
        events: { ref: eventsRef, data: initialEvents },
        tasks: { ref: tasksRef, data: initialTasks },
        shoppingListItems: { ref: shoppingListRef, data: initialShoppingListItems },
        dogPlan: { ref: dogPlanRef, data: initialDogPlanItems },
        locations: { ref: locationsRef, data: initialLocations },
      };
  
      const populateFirestore = async () => {
        const batch = writeBatch(firestore);
        let hasWrites = false;
  
        for (const [key, { ref, data }] of Object.entries(collections)) {
          if (ref) {
            const snapshot = await getDocs(ref);
            if (snapshot.empty) {
              console.log(`Populating ${key} collection...`);
              data.forEach((item: any) => {
                const docRef = doc(ref, item.id);
                batch.set(docRef, item);
              });
              hasWrites = true;
            }
          }
        }
  
        if (hasWrites) {
          try {
            await batch.commit();
            console.log('Successfully populated initial data.');
          } catch (error) {
            console.error('Error populating initial data:', error);
          }
        }
      };
  
      populateFirestore();
    }
  }, [firestore, familyName, eventsRef, tasksRef, shoppingListRef, dogPlanRef, locationsRef]);


  React.useEffect(() => {
    if (eventsData) setLocalEvents(eventsData.map(e => ({...e, start: (e.start as any).toDate(), end: (e.end as any).toDate() })));
  }, [eventsData]);

  React.useEffect(() => {
    if (tasksData) setLocalTasks(tasksData.map(t => ({...t, dueDate: (t.dueDate as any).toDate()})))
  }, [tasksData]);

  React.useEffect(() => {
    if (shoppingListData) setLocalShoppingItems(shoppingListData);
  }, [shoppingListData]);

  React.useEffect(() => {
    if (dogPlanData) setLocalDogPlanItems(dogPlanData);
  }, [dogPlanData]);

  React.useEffect(() => {
    if (locationsData) setLocalLocations(locationsData);
  }, [locationsData]);


  const handleAddEvent = (newEvent: Omit<Event, 'id'>) => {
    if (eventsRef) {
      addDoc(eventsRef, newEvent);
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
    const events = localEvents;
    const tasks = localTasks;
    const shoppingItems = localShoppingItems;
    const dogPlanItems = localDogPlanItems;

    if (selectedCalendarId === 'all') {
        return { events, tasks, shoppingItems, dogPlanItems, members: familyMembers };
    }
    
    const meId = 'me'; // assuming 'me' is the current user's id

    if (selectedCalendarId === 'my_calendar') {
        const myEvents = events.filter(event => event.participants.includes(meId));
        const myTasks = tasks.filter(task => task.assignedTo === meId);
        const myShoppingItems = shoppingItems.filter(item => item.addedBy === meId);
        const myDogPlanItems = dogPlanItems.filter(item => item.assignedTo === meId);
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
    
    const groupEvents = events.filter(event => event.participants.some(p => memberIdsInGroup.has(p)));
    const groupTasks = tasks.filter(task => memberIdsInGroup.has(task.assignedTo));
    const groupShoppingItems = shoppingItems.filter(item => memberIdsInGroup.has(item.addedBy));
    const groupDogPlanItems = dogPlanItems.filter(item => item.assignedTo && memberIdsInGroup.has(item.assignedTo));
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
              <CalendarView events={filteredData.events} locations={localLocations} />
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
