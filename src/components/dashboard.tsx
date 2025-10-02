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
import { initialEvents, initialTasks, initialShoppingListItems, initialDogPlanItems, initialLocations, calendarGroups, initialFamilyMembers } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember, DogPlanItem, Location } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, setDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import EventDialog from './event-dialog';
import { Button } from './ui/button';
import WeekView from './week-view';
import DayView from './day-view';
import TaskDialog from './task-dialog';

type CalendarViewType = 'month' | 'week' | 'day';

export default function Dashboard() {
  const [selectedCalendarId, setSelectedCalendarId] = useState('all');
  const { firestore } = useFirebase();
  const { user } = useUser();
  
  const userDocRef = useMemoFirebase(() => (firestore && user?.uid ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userData } = useDoc<FamilyMember>(userDocRef);
  const familyName = userData?.familyName;

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(initialFamilyMembers);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  
  const [isDataPopulated, setIsDataPopulated] = useState(false);

  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const familyBasedRef = (collectionName: string) => useMemoFirebase(() => (firestore && familyName ? collection(firestore, `families/${familyName}/${collectionName}`) : null), [firestore, familyName]);

  const eventsRef = familyBasedRef('events');
  const tasksRef = familyBasedRef('tasks');
  const shoppingListRef = familyBasedRef('shoppingListItems');
  const dogPlanRef = familyBasedRef('dogPlan');
  const locationsRef = familyBasedRef('locations');
  

  const { data: eventsData, isLoading: eventsLoading } = useCollection<Event>(eventsRef);
  const { data: tasksData, isLoading: tasksLoading } = useCollection<Task>(tasksRef);
  const { data: shoppingListData, isLoading: shoppingLoading } = useCollection<ShoppingListItem>(shoppingListRef);
  const { data: dogPlanData, isLoading: dogPlanLoading } = useCollection<DogPlanItem>(dogPlanRef);
  const { data: locationsData, isLoading: locationsLoading } = useCollection<Location>(locationsRef);
    

    useEffect(() => {
    if (firestore && user && familyName && !eventsLoading && !isDataPopulated && eventsData?.length === 0) {
      const populateFirestore = async () => {
        if (!familyName.startsWith('Familie-Butz-Braun')) {
            setIsDataPopulated(true);
            return;
        }

        const populateRef = doc(firestore, `families/${familyName}/meta`, 'populated');
        const populateSnap = await getDoc(populateRef);

        if (populateSnap.exists()) {
          setIsDataPopulated(true);
          return;
        }

        const batch = writeBatch(firestore);

        initialEvents.forEach(event => {
          const eventRef = doc(collection(firestore, `families/${familyName}/events`));
          batch.set(eventRef, event);
        });

        initialTasks.forEach(task => {
          const taskRef = doc(collection(firestore, `families/${familyName}/tasks`));
          batch.set(taskRef, task);
        });
        
        initialShoppingListItems.forEach(item => {
            const itemRef = doc(collection(firestore, `families/${familyName}/shoppingListItems`));
            batch.set(itemRef, item);
        });

        initialDogPlanItems.forEach(item => {
            const itemRef = doc(collection(firestore, `families/${familyName}/dogPlan`));
            batch.set(itemRef, item);
        });

        initialLocations.forEach(location => {
            const locationRef = doc(collection(firestore, `families/${familyName}/locations`));
            batch.set(locationRef, location);
        });

        batch.set(populateRef, { populatedBy: user.uid, populatedAt: new Date() });

        await batch.commit();
        setIsDataPopulated(true);
      };

      populateFirestore().catch(console.error);
    }
  }, [firestore, user, familyName, eventsLoading, isDataPopulated, eventsData]);

  const me = useMemo(() => {
    // The first user in the static list is considered "me" for now
    return familyMembers.find(m => m.id === 'me');
  }, [familyMembers]);
  
  const localEvents = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.map(e => ({...e, start: (e.start as any).toDate(), end: (e.end as any).toDate() }));
  }, [eventsData]);

  const localTasks = useMemo(() => {
    if (!tasksData) return [];
    const currentUserId = user?.uid;
    return tasksData
      .map(t => ({...t, dueDate: (t.dueDate as any).toDate()}))
      .filter(t => t.visibility === 'public' || (t.visibility === 'private' && (t.assignedTo === currentUserId || t.addedBy === currentUserId)));

  }, [tasksData, user]);
  
  const localShoppingItems = useMemo(() => shoppingListData || [], [shoppingListData]);
  const localDogPlanItems = useMemo(() => dogPlanData || [], [dogPlanData]);
  const localLocations = useMemo(() => locationsData || [], [locationsData]);


  const handleOpenEventDialog = (event?: Event) => {
    if (!event && user) {
        // For new events, pre-fill the current user as a participant
        const newEventTemplate: Partial<Event> = {
            title: '',
            participants: ['me'], // Use static 'me' id
            allDay: false,
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
        };
        setSelectedEvent(newEventTemplate as Event);
    } else {
        setSelectedEvent(event);
    }
    setIsEventDialogOpen(true);
  };
  
  const handleSaveEvent = (eventData: Omit<Event, 'id'> | Event) => {
    if ('id' in eventData && eventData.id) {
      if (firestore && eventsRef) {
        const eventDocRef = doc(eventsRef, eventData.id);
        updateDoc(eventDocRef, eventData as any);
      }
    } else {
      if (firestore && eventsRef) {
        addDoc(eventsRef, eventData);
      }
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (firestore && eventsRef) {
      const eventDocRef = doc(eventsRef, eventId);
      deleteDoc(eventDocRef);
    }
  };

  const handleOpenTaskDialog = (task?: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'addedBy'> | Task) => {
     const dataWithAddedBy = { ...taskData, addedBy: ('addedBy' in taskData && taskData.addedBy) || user?.uid || 'unknown' };
     if ('id' in dataWithAddedBy && dataWithAddedBy.id) {
      if (firestore && tasksRef) {
        const taskDocRef = doc(tasksRef, dataWithAddedBy.id);
        updateDoc(taskDocRef, dataWithAddedBy as any);
      }
    } else {
      if (firestore && tasksRef) {
        addDoc(tasksRef, dataWithAddedBy);
      }
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (firestore && tasksRef) {
      const taskDocRef = doc(tasksRef, taskId);
      deleteDoc(taskDocRef);
    }
  }

  const handleAddShoppingItem = (itemName: string, assignedTo?: string) => {
    if (shoppingListRef && user) {
        addDoc(shoppingListRef, {
            name: itemName,
            addedBy: user.uid,
            purchased: false,
            assignedTo: assignedTo || '',
        });
    }
  };

  const handleUpdateShoppingItem = (itemId: string, data: Partial<ShoppingListItem>) => {
    if (shoppingListRef) {
        const itemDocRef = doc(shoppingListRef, itemId);
        updateDoc(itemDocRef, data);
    }
  };

  const handleDeleteShoppingItem = (itemId: string) => {
    if (shoppingListRef) {
        const itemDocRef = doc(shoppingListRef, itemId);
        deleteDoc(itemDocRef);
    }
  };

 const handleUpdateDogPlanItem = (item: DogPlanItem) => {
    if (dogPlanRef) {
        // Check if the item has an ID. If not, it's a new assignment.
        if (item.id && item.id.startsWith('d_')) {
            // This is a placeholder ID. We need to find if an item for this slot already exists.
            const findQuery = query(dogPlanRef, where("day", "==", item.day), where("timeOfDay", "==", item.timeOfDay));
            getDocs(findQuery).then(snapshot => {
                if (!snapshot.empty) {
                    // Update existing item
                    const existingDoc = snapshot.docs[0];
                    const itemDocRef = doc(dogPlanRef, existingDoc.id);
                    updateDoc(itemDocRef, { assignedTo: item.assignedTo });
                } else if (item.assignedTo) { // Only add if someone is assigned
                    // Add new item (without placeholder id)
                    const { id, ...newItemData } = item;
                    addDoc(dogPlanRef, newItemData);
                }
            });
        } else if (item.id) {
            // This is an existing item with a real Firestore ID.
            const itemDocRef = doc(dogPlanRef, item.id);
            if (item.assignedTo) {
                updateDoc(itemDocRef, { assignedTo: item.assignedTo });
            } else {
                deleteDoc(itemDocRef);
            }
        }
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
     if (firestore && user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDoc(userDocRef, { name: updatedMember.name });
    }
  };

  const currentGroup = useMemo(() => {
    if (selectedCalendarId === 'all') {
      return { id: 'all', name: 'Gesamte Familie', members: familyMembers.map(m => m.id) };
    }
    if (selectedCalendarId === 'my_calendar') {
      const meMember = familyMembers.find(m => m.id === 'me'); // Use static id
      return { id: 'my_calendar', name: 'Mein Kalender', members: meMember ? [meMember.id] : [] };
    }
    return calendarGroups.find(g => g.id === selectedCalendarId);
  }, [selectedCalendarId, familyMembers]);

  const filteredData = useMemo(() => {
    const currentUserId = 'me'; // Use static ID

    if (selectedCalendarId === 'all') {
        return { events: localEvents, tasks: localTasks, shoppingItems: localShoppingItems, dogPlanItems: localDogPlanItems, members: familyMembers };
    }
    
    if (selectedCalendarId === 'my_calendar') {
        const myEvents = localEvents.filter(event => event.participants.includes(currentUserId || ''));
        const myTasks = localTasks.filter(task => task.assignedTo === currentUserId);
        const myShoppingItems = localShoppingItems.filter(item => item.assignedTo === currentUserId);
        const myDogPlanItems = localDogPlanItems.filter(item => item.assignedTo === currentUserId);
        const meMember = familyMembers.find(m => m.id === currentUserId);

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
    const groupShoppingItems = localShoppingItems; 
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
          me={me}
        />
        <div className="flex flex-1 flex-col">
          <AppHeader
            groupName={currentGroup?.name || 'Familienplaner'}
            groupMembers={filteredData.members}
            onAddEvent={() => handleOpenEventDialog()}
            eventsToSync={filteredData.events}
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
                <TaskList 
                    tasks={filteredData.tasks} 
                    members={familyMembers}
                    onTaskClick={handleOpenTaskDialog}
                    onNewTaskClick={() => handleOpenTaskDialog()}
                />
              </TabsContent>
              <TabsContent value="shopping" className="mt-4">
                <ShoppingList 
                    items={filteredData.shoppingItems} 
                    members={familyMembers}
                    onAddItem={handleAddShoppingItem}
                    onUpdateItem={handleUpdateShoppingItem}
                    onDeleteItem={handleDeleteShoppingItem}
                    currentUserId={user?.uid || ''}
                />
              </TabsContent>
              <TabsContent value="dog-plan" className="mt-4">
                <DogPlan items={localDogPlanItems} members={familyMembers} onUpdateItem={handleUpdateDogPlanItem} />
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
      <TaskDialog
        isOpen={isTaskDialogOpen}
        setIsOpen={setIsTaskDialogOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        familyMembers={familyMembers}
      />
    </>
  );
}
