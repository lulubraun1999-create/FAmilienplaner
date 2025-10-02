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
import { initialEvents, initialTasks, initialShoppingListItems, initialDogPlanItems, initialLocations } from '@/lib/data';
import type { CalendarGroup, Event, Task, ShoppingListItem, FamilyMember, DogPlanItem, Location } from '@/lib/types';
import { useFirebase, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { errorEmitter, FirestorePermissionError } from '@/firebase';
import EventDialog from './event-dialog';
import { Button } from './ui/button';
import WeekView from './week-view';
import DayView from './day-view';
import TaskDialog from './task-dialog';
import { familyData, allFamilyMembers } from '@/lib/family-data';

type CalendarViewType = 'month' | 'week' | 'day';

export default function Dashboard() {
  const [selectedCalendarId, setSelectedCalendarId] = useState('all');
  const { firestore } = useFirebase();
  const { user } = useUser();
  
  const { me, familyName, familyMembers } = useMemo(() => {
    if (!user?.email) return { me: undefined, familyName: undefined, familyMembers: [] };
    
    const memberInfo = allFamilyMembers.find(m => m.email === user.email);
    if (!memberInfo) return { me: undefined, familyName: undefined, familyMembers: [] };
    
    const familyInfo = familyData.find(f => f.members.some(m => m.id === memberInfo.id));
    const familyMembers = familyInfo?.members || [];
    const familyName = familyInfo?.id;

    return { me: memberInfo, familyName, familyMembers };
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
      setIsDataPopulated(true); // Prevent this from running multiple times
      
      const populateFirestore = async () => {
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

        try {
            await batch.commit();
        } catch(e) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `families/${familyName}/`,
                operation: 'write',
                requestResourceData: {note: 'Batch write for initial data population'}
            }));
        }
      };

      populateFirestore();
    }
  }, [firestore, user, familyName, eventsLoading, isDataPopulated, eventsData]);

  const calendarGroups: CalendarGroup[] = useMemo(() => {
    // Generate groups from the static family data
    return familyData.map(family => ({
        id: family.id,
        name: family.name,
        members: family.members.map(member => member.id),
    }));
  }, []);
  
  const localEvents = useMemo(() => {
    if (!eventsData) return [];
    return eventsData.map(e => ({...e, start: (e.start as any).toDate(), end: (e.end as any).toDate() }));
  }, [eventsData]);

  const localTasks = useMemo(() => {
    if (!tasksData) return [];
    const myStaticId = me?.id;
    return tasksData
      .map(t => ({...t, dueDate: (t.dueDate as any).toDate()}))
      .filter(t => t.visibility === 'public' || (t.visibility === 'private' && (t.assignedTo === myStaticId || t.addedBy === myStaticId)));

  }, [tasksData, me]);
  
  const localShoppingItems = useMemo(() => shoppingListData || [], [shoppingListData]);
  const localDogPlanItems = useMemo(() => dogPlanData || [], [dogPlanData]);
  const localLocations = useMemo(() => locationsData || [], [locationsData]);


  const handleOpenEventDialog = (event?: Event) => {
    if (!event && me) { // Use 'me' object which has a consistent ID
        const newEventTemplate: Partial<Event> = {
            title: '',
            participants: [me.id],
            allDay: false,
            start: new Date(),
            end: new Date(new Date().getTime() + 60 * 60 * 1000), 
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
     const dataWithAddedBy = { ...taskData, addedBy: ('addedBy' in taskData && taskData.addedBy) || me?.id || 'unknown' };
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

  const handleUpdateTask = (taskId: string, data: Partial<Task>) => {
    if (tasksRef) {
      const taskDocRef = doc(tasksRef, taskId);
      updateDoc(taskDocRef, data).catch((e) => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: taskDocRef.path,
            operation: 'update',
            requestResourceData: data,
          })
        );
      });
    }
  };

  const handleAddShoppingItem = (itemName: string, assignedTo?: string) => {
    if (shoppingListRef && me) {
        const newItem = {
            name: itemName,
            addedBy: me.id,
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

 const handleUpdateDogPlanItem = (item: DogPlanItem, isNew: boolean) => {
    if (dogPlanRef) {
        if (isNew) {
            const { id, ...newItemData } = item;
             if (item.assignedTo) {
                addDoc(dogPlanRef, newItemData).catch(e => {
                    errorEmitter.emit('permission-error', new FirestorePermissionError({
                        path: dogPlanRef.path,
                        operation: 'create',
                        requestResourceData: newItemData
                    }));
                });
             }
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
     if (user) {
        // Only update the display name in Firebase Auth, as we don't have a user document
        updateProfile(user, { displayName: updatedMember.name });
        // The local state will update automatically via the user object listener
     }
  };

  const currentGroup = useMemo(() => {
    if (selectedCalendarId === 'all') {
      return { id: 'all', name: 'Gesamte Familie', members: familyMembers.map(m => m.id) };
    }
    if (selectedCalendarId === 'my_calendar') {
      return { id: 'my_calendar', name: 'Mein Kalender', members: me ? [me.id] : [] };
    }
    return calendarGroups.find(g => g.id === selectedCalendarId);
  }, [selectedCalendarId, familyMembers, me, calendarGroups]);

  const filteredData = useMemo(() => {
    if (selectedCalendarId === 'all' || !currentGroup) {
        return { events: localEvents, tasks: localTasks, shoppingItems: localShoppingItems, dogPlanItems: localDogPlanItems, members: familyMembers };
    }
    
    if (selectedCalendarId === 'my_calendar') {
        const myUserId = me?.id || '';
        const myEvents = localEvents.filter(event => event.participants.includes(myUserId));
        const myTasks = localTasks.filter(task => task.assignedTo === myUserId);
        const myShoppingItems = localShoppingItems.filter(item => item.assignedTo === myUserId);
        const myDogPlanItems = localDogPlanItems.filter(item => item.assignedTo === myUserId);
        const meMember = familyMembers.find(m => m.id === myUserId);

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
  }, [selectedCalendarId, currentGroup, localEvents, localTasks, localShoppingItems, localDogPlanItems, familyMembers, me]);


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
                    members={familyMembers}
                    onTaskClick={handleOpenTaskDialog}
                    onNewTaskClick={() => handleOpenTaskDialog()}
                    onUpdateTask={handleUpdateTask}
                />
              </TabsContent>
              <TabsContent value="shopping" className="mt-4">
                <ShoppingList 
                    items={filteredData.shoppingItems} 
                    members={familyMembers}
                    onAddItem={handleAddShoppingItem}
                    onUpdateItem={handleUpdateShoppingItem}
                    onDeleteItem={handleDeleteShoppingItem}
                    currentUserId={me?.id || ''}
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
        familyMembers={familyMembers}
      />
    </>
  );
}
