import type { FamilyMember, CalendarGroup, Event, Task, ShoppingListItem, DogPlanItem, Location } from './types';
import { Timestamp } from 'firebase/firestore';

export const initialFamilyMembers: FamilyMember[] = [
  { id: 'dad', name: 'Matthias Butz', avatar: {} },
  { id: 'mom', name: 'Katrin Butz', avatar: {} },
  { id: 'sister', name: 'Lena Butz', avatar: {} },
  { id: 'me', name: 'Lukas Braun', avatar: {} },
  { id: 'grandma', name: 'Editha Fröhle', avatar: {} },
  { id: 'grandpa', name: 'Rolf Fröhle', avatar: {} },
  { id: 'aunt', name: 'Sandra Fröhle', avatar: {} },
  { id: 'uncle', name: 'Markus Weiß', avatar: {} },
];

export const calendarGroups: CalendarGroup[] = [
  { id: 'c_immediate', name: 'Familie Butz/Braun', members: ['dad', 'mom', 'sister', 'me'] },
  { id: 'c_grandparents', name: 'Familie Fröhle', members: ['grandma', 'grandpa'] },
  { id: 'c_aunt_uncle', name: 'Familie Fröhle/Weiß', members: ['aunt', 'uncle'] },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const initialLocations: Location[] = [
    { id: 'loc1', name: 'Sportplatz', street: 'Am Sportpark', housenumber: '1', postalcode: '12345', city: 'Musterstadt' },
    { id: 'loc2', name: 'Dr. Smile', street: 'Hauptstraße', housenumber: '10', postalcode: '54321', city: 'Beispielburg' },
    { id: 'loc3', name: 'Schule', street: 'Schulweg', housenumber: '2', postalcode: '12345', city: 'Musterstadt' },
];

export const initialEvents: Event[] = [
  {
    id: 'evt1',
    title: 'Fußballtraining',
    start: new Date(new Date(today).setHours(17, 0, 0, 0)),
    end: new Date(new Date(today).setHours(18, 30, 0, 0)),
    participants: ['sister'],
    locationId: 'loc1',
  },
  {
    id: 'evt2',
    title: 'Zahnarzttermin',
    start: new Date(new Date(tomorrow).setHours(10, 0, 0, 0)),
    end: new Date(new Date(tomorrow).setHours(10, 30, 0, 0)),
    participants: ['me'],
    locationId: 'loc2'
  },
  {
    id: 'evt3',
    title: 'Kaffeeklatsch',
    start: new Date(new Date(tomorrow).setHours(15, 0, 0, 0)),
    end: new Date(new Date(tomorrow).setHours(17, 0, 0, 0)),
    participants: ['grandma', 'grandpa'],
  },
   {
    id: 'evt4',
    title: 'Elternabend',
    start: new Date(new Date(nextWeek).setHours(19, 0, 0, 0)),
    end: new Date(new Date(nextWeek).setHours(20, 0, 0, 0)),
    participants: ['dad', 'mom'],
    locationId: 'loc3',
  },
];

export const initialTasks: Task[] = [
    { id: 't1', title: 'Müll rausbringen', assignedTo: 'sister', dueDate: today, priority: 'medium', completed: false, visibility: 'public', addedBy: 'mom' },
    { id: 't2', title: 'Geschenk für Oma kaufen', assignedTo: 'me', dueDate: tomorrow, priority: 'high', completed: false, visibility: 'public', addedBy: 'mom' },
    { id: 't3', title: 'Auto zur Werkstatt bringen', assignedTo: 'dad', dueDate: nextWeek, priority: 'medium', completed: false, visibility: 'private', addedBy: 'dad' },
    { id: 't4', title: 'Blumen gießen', assignedTo: 'grandma', dueDate: today, priority: 'low', completed: true, visibility: 'public', addedBy: 'grandma' },
];

export const initialShoppingListItems: ShoppingListItem[] = [
    { id: 's1', name: 'Milch', addedBy: 'mom', purchased: false, assignedTo: '' },
    { id: 's2', name: 'Brot', addedBy: 'mom', purchased: true, assignedTo: 'mom' },
    { id: 's3', name: 'Eier', addedBy: 'dad', purchased: false, assignedTo: 'dad' },
    { id: 's4', name: 'Butter', addedBy: 'me', purchased: false, assignedTo: '' },
    { id: 's5', name: 'Kaffee', addedBy: 'grandpa', purchased: false, assignedTo: '' },
];

export const initialDogPlanItems: DogPlanItem[] = [
    { id: 'd_mo_m', day: 'Montag', timeOfDay: 'Morgen', assignedTo: 'dad' },
    { id: 'd_mo_a', day: 'Montag', timeOfDay: 'Abend', assignedTo: 'mom' },
    { id: 'd_di_m', day: 'Dienstag', timeOfDay: 'Morgen', assignedTo: 'dad' },
    { id: 'd_di_a', day: 'Dienstag', timeOfDay: 'Abend', assignedTo: 'mom' },
    { id: 'd_mi_m', day: 'Mittwoch', timeOfDay: 'Morgen', assignedTo: 'sister' },
    { id: 'd_mi_a', day: 'Mittwoch', timeOfDay: 'Abend', assignedTo: 'me' },
];


// Mock iCal data for AI suggestions
export const familyICalData: Record<string, string[]> = {
    'Matthias Butz': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(new Date(nextWeek).setHours(19,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(new Date(nextWeek).setHours(20,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Elternabend\nEND:VEVENT\nEND:VCALENDAR`
    ],
    'Katrin Butz': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(new Date(nextWeek).setHours(19,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(new Date(nextWeek).setHours(20,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Elternabend\nEND:VEVENT\nEND:VCALENDAR`
    ],
    'Lena Butz': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(new Date().setHours(17,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(new Date().setHours(18,30,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Fußballtraining\nEND:VEVENT\nEND:VCALENDAR`
    ],
    'Lukas Braun': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10,30,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Zahnarzttermin\nEND:VEVENT\nEND:VCALENDAR`
    ],
};
