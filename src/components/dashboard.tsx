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
import { initialEvents, initialTasks, initialShoppingListItems, initialDogPlanItems, initialLocations, initialFamilyMembers } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember, DogPlanItem, Location } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, useUser, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
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
  
  // Use static family members to avoid permission issues
  const familyMembers = useMemo(() => {
    if (user) {
        const currentUserInList = initialFamilyMembers.find(m => m.email === user.email);
        if(currentUserInList) {
            // make sure the current user has the correct id
            currentUserInList.id = user.uid;
            return initialFamilyMembers;
        }
        return [{ id: user.uid, name: user.displayName || 'Benutzer', email: user.email || '', avatar: {} }];
    }
    return [];
  }, [user]);


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
        // This check prevents re-populating data on every load.
        // We use a document in a meta collection to track if population has occurred.
        const populateRef = doc(firestore, `families/${familyName}/meta`, 'populated');
        const populateSnap = await getDoc(populateRef);

        if (populateSnap.exists()) {
          setIsDataPopulated(true);
          return;
        }

        // Only populate for the first family to avoid data clashes
        if (familyName !== 'Familie-Butz-Braun') {
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

        // Mark that this family has been populated
        batch.set(populateRef, { populatedBy: user.uid, populatedAt: new Date() });

        try {
            await batch.commit();
        } catch(e) {
            console.error("Error populating data", e);
        }
        setIsDataPopulated(true);
      };

      populateFirestore().catch(console.error);
    }
  }, [firestore, user, familyName, eventsLoading, isDataPopulated, eventsData]);

  const me = useMemo(() => {
    return familyMembers?.find(m => m.id === user?.uid);
  }, [familyMembers, user]);

  const calendarGroups: CalendarGroup[] = useMemo(() => {
    if (!familyName) return [];
    if (familyName === 'Familie-Butz-Braun') {
        return [{ id: 'c_butz_braun', name: 'Kinder', members: ['me'] }]; // Example group
    }
    return [];
  }, [familyName]);
  
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
            participants: [user.uid],
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
        updateDoc(eventDocRef, eventData as any).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: eventDocRef.path,
                operation: 'update',
                requestResourceData: eventData
            }));
        });
      }
    } else {
      if (firestore && eventsRef) {
        addDoc(eventsRef, eventData).catch(e => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: eventsRef.path,
                operation: 'create',
                requestResourceData: eventData
            }));
        });
      }
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (firestore && eventsRef) {
      const eventDocRef = doc(eventsRef, eventId);
      deleteDoc(eventDocRef).catch(e => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: eventDocRef.path,
            operation: 'delete'
          }));
      });
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
        updateDoc(taskDocRef, dataWithAddedBy as any).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: taskDocRef.path,
                operation: 'update',
                requestResourceData: dataWithAddedBy
            }));
        });
      }
    } else {
      if (firestore && tasksRef) {
        addDoc(tasksRef, dataWithAddedBy).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: tasksRef.path,
                operation: 'create',
                requestResourceData: dataWithAddedBy
            }));
        });
      }
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (firestore && tasksRef) {
      const taskDocRef = doc(tasksRef, taskId);
      deleteDoc(taskDocRef).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: taskDocRef.path,
                operation: 'delete'
            }));
      });
    }
  }

  const handleAddShoppingItem = (itemName: string, assignedTo?: string) => {
    if (shoppingListRef && user) {
        const newItem = {
            name: itemName,
            addedBy: user.uid,
            purchased: false,
            assignedTo: assignedTo || '',
        };
        addDoc(shoppingListRef, newItem).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: shoppingListRef.path,
                operation: 'create',
                requestResourceData: newItem
            }));
        });
    }
  };

  const handleUpdateShoppingItem = (itemId: string, data: Partial<ShoppingListItem>) => {
    if (shoppingListRef) {
        const itemDocRef = doc(shoppingListRef, itemId);
        updateDoc(itemDocRef, data).catch(e => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: itemDocRef.path,
                operation: 'update',
                requestResourceData: data
            }));
        });
    }
  };

  const handleDeleteShoppingItem = (itemId: string) => {
    if (shoppingListRef) {
        const itemDocRef = doc(shoppingListRef, itemId);
        deleteDoc(itemDocRef).catch(e => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: itemDocRef.path,
                operation: 'delete'
            }));
        });
    }
  };

 const handleUpdateDogPlanItem = (item: DogPlanItem) => {
    if (dogPlanRef) {
        if (item.id && item.id.startsWith('d_')) {
            const findQuery = query(dogPlanRef, where("day", "==", item.day), where("timeOfDay", "==", item.timeOfDay));
            getDocs(findQuery).then(snapshot => {
                if (!snapshot.empty) {
                    const existingDoc = snapshot.docs[0];
                    const itemDocRef = doc(dogPlanRef, existingDoc.id);
                    const updateData = { assignedTo: item.assignedTo };
                    updateDoc(itemDocRef, updateData).catch(e => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: itemDocRef.path,
                            operation: 'update',
                            requestResourceData: updateData
                        }));
                    });
                } else if (item.assignedTo) {
                    const { id, ...newItemData } = item;
                    addDoc(dogPlanRef, newItemData).catch(e => {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({
                            path: dogPlanRef.path,
                            operation: 'create',
                            requestResourceData: newItemData
                        }));
                    });
                }
            });
        } else if (item.id) {
            const itemDocRef = doc(dogPlanRef, item.id);
            if (item.assignedTo) {
                const updateData = { assignedTo: item.assignedTo };
                updateDoc(itemDocRef, updateData).catch(e => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: itemDocRef.path,
                        operation: 'update',
                        requestResourceData: updateData
                    }));
                });
            } else {
                deleteDoc(itemDocRef).catch(e => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: itemDocRef.path,
                        operation: 'delete'
                    }));
                });
            }
        }
    }
};


  const handleAddLocation = async (newLocation: Omit<Location, 'id'>): Promise<string> => {
    if (locationsRef) {
      try {
        const docRef = await addDoc(locationsRef, newLocation);
        return docRef.id;
      } catch (e) {
         errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: locationsRef.path,
            operation: 'create',
            requestResourceData: newLocation
         }));
         return '';
      }
    }
    return '';
  };
  
  const handleUpdateProfile = (updatedMember: FamilyMember) => {
     if (firestore && user) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const updateData = { name: updatedMember.name };
      updateDoc(userDocRef, updateData).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: updateData
        }));
      });
    }
  };

  const currentGroup = useMemo(() => {
    const members = familyMembers || [];
    if (selectedCalendarId === 'all') {
      return { id: 'all', name: 'Gesamte Familie', members: members.map(m => m.id) };
    }
    if (selectedCalendarId === 'my_calendar') {
      return { id: 'my_calendar', name: 'Mein Kalender', members: me ? [me.id] : [] };
    }
    return calendarGroups.find(g => g.id === selectedCalendarId);
  }, [selectedCalendarId, familyMembers, me, calendarGroups]);

  const filteredData = useMemo(() => {
    const currentUserId = user?.uid;
    const members = familyMembers || [];

    if (selectedCalendarId === 'all' || !currentGroup) {
        return { events: localEvents, tasks: localTasks, shoppingItems: localShoppingItems, dogPlanItems: localDogPlanItems, members: members };
    }
    
    if (selectedCalendarId === 'my_calendar') {
        const myEvents = localEvents.filter(event => event.participants.includes(currentUserId || ''));
        const myTasks = localTasks.filter(task => task.assignedTo === currentUserId);
        const myShoppingItems = localShoppingItems.filter(item => item.assignedTo === currentUserId);
        const myDogPlanItems = localDogPlanItems.filter(item => item.assignedTo === currentUserId);
        const meMember = members.find(m => m.id === currentUserId);

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
    const membersInGroup = members.filter(m => memberIdsInGroup.has(m.id));

    return {
      events: groupEvents,
      tasks: groupTasks,
      shoppingItems: groupShoppingItems,
      dogPlanItems: groupDogPlanItems,
      members: membersInGroup
    };
  }, [selectedCalendarId, currentGroup, localEvents, localTasks, localShoppingItems, localDogPlanItems, familyMembers, user]);


  return (
    <>
      <div className="flex h-screen w-full bg-background font-body text-foreground">
        <AppSidebar
          calendarGroups={calendarGroups}
          selectedCalendarId={selectedCalendarId}
          onCalendarChange={setSelectedCalendarId}
          familyMembers={familyMembers || []}
          onUpdateProfile={handleUpdateProfile}
          me={me}
        />
        <div className="flex flex-1 flex-col">
          <AppHeader
            groupName={currentGroup?.name || 'Vierklang'}
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
                    members={familyMembers || []}
                    onTaskClick={handleOpenTaskDialog}
                    onNewTaskClick={() => handleOpenTaskDialog()}
                />
              </TabsContent>
              <TabsContent value="shopping" className="mt-4">
                <ShoppingList 
                    items={filteredData.shoppingItems} 
                    members={familyMembers || []}
                    onAddItem={handleAddShoppingItem}
                    onUpdateItem={handleUpdateShoppingItem}
                    onDeleteItem={handleDeleteShoppingItem}
                    currentUserId={user?.uid || ''}
                />
              </TabsContent>
              <TabsContent value="dog-plan" className="mt-4">
                <DogPlan items={localDogPlanItems} members={familyMembers || []} onUpdateItem={handleUpdateDogPlanItem} />
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
        allFamilyMembers={familyMembers || []}
        calendarGroups={[{id: 'all', name: 'Alle', members: (familyMembers || []).map(m => m.id)}, ...calendarGroups]}
        locations={localLocations}
        onAddLocation={handleAddLocation}
      />
      <TaskDialog
        isOpen={isTaskDialogOpen}
        setIsOpen={setIsTaskDialogOpen}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
        familyMembers={familyMembers || []}
      />
    </>
  );
}

    

    

    