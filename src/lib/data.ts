import { PlaceHolderImages } from './placeholder-images';
import type { FamilyMember, CalendarGroup, Event, Task, ShoppingListItem, DogPlanItem, Location } from './types';
import { Timestamp } from 'firebase/firestore';

const findImage = (id: string) => {
    const image = PlaceHolderImages.find(img => img.id === id);
    if (!image) throw new Error(`Image with id ${id} not found`);
    return image;
}

export const initialFamilyMembers: FamilyMember[] = [
  { id: 'dad', name: 'Matthias Butz', avatar: findImage('dad') },
  { id: 'mom', name: 'Katrin Butz', avatar: findImage('mom') },
  { id: 'sister', name: 'Lena Butz', avatar: findImage('sister') },
  { id: 'me', name: 'Lukas Braun', avatar: findImage('me') },
  { id: 'grandma', name: 'Editha Fröhle', avatar: findImage('grandma') },
  { id: 'grandpa', name: 'Rolf Fröhle', avatar: findImage('grandpa') },
  { id: 'aunt', name: 'Sandra Fröhle', avatar: findImage('aunt') },
  { id: 'uncle', name: 'Markus Weiß', avatar: findImage('uncle') },
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

export const initialLocations: Omit<Location, 'id'>[] = [
    { name: 'Sportplatz', street: 'Am Sportpark', housenumber: '1', postalcode: '12345', city: 'Musterstadt' },
    { name: 'Dr. Smile', street: 'Hauptstraße', housenumber: '10', postalcode: '54321', city: 'Beispielburg' },
    { name: 'Schule', street: 'Schulweg', housenumber: '2', postalcode: '12345', city: 'Musterstadt' },
];

export const initialEvents: Omit<Event, 'id' | 'locationId'>[] = [
  {
    title: 'Fußballtraining',
    start: new Date(new Date(today).setHours(17, 0, 0, 0)),
    end: new Date(new Date(today).setHours(18, 30, 0, 0)),
    participants: ['sister'],
  },
  {
    title: 'Zahnarzttermin',
    start: new Date(new Date(tomorrow).setHours(10, 0, 0, 0)),
    end: new Date(new Date(tomorrow).setHours(10, 30, 0, 0)),
    participants: ['me'],
  },
  {
    title: 'Kaffeeklatsch',
    start: new Date(new Date(tomorrow).setHours(15, 0, 0, 0)),
    end: new Date(new Date(tomorrow).setHours(17, 0, 0, 0)),
    participants: ['grandma', 'grandpa'],
  },
   {
    title: 'Elternabend',
    start: new Date(new Date(nextWeek).setHours(19, 0, 0, 0)),
    end: new Date(new Date(nextWeek).setHours(20, 0, 0, 0)),
    participants: ['dad', 'mom'],
  },
];

export const initialTasks: Task[] = [
    { id: 't1', title: 'Müll rausbringen', assignedTo: 'sister', dueDate: today, priority: 'medium', completed: false },
    { id: 't2', title: 'Geschenk für Oma kaufen', assignedTo: 'me', dueDate: tomorrow, priority: 'high', completed: false },
    { id: 't3', title: 'Auto zur Werkstatt bringen', assignedTo: 'dad', dueDate: nextWeek, priority: 'medium', completed: false },
    { id: 't4', title: 'Blumen gießen', assignedTo: 'grandma', dueDate: today, priority: 'low', completed: true },
];

export const initialShoppingListItems: ShoppingListItem[] = [
    { id: 's1', name: 'Milch', addedBy: 'mom', purchased: false },
    { id: 's2', name: 'Brot', addedBy: 'mom', purchased: true },
    { id: 's3', name: 'Eier', addedBy: 'dad', purchased: false },
    { id: 's4', name: 'Butter', addedBy: 'me', purchased: false },
    { id: 's5', name: 'Kaffee', addedBy: 'grandpa', purchased: false },
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
