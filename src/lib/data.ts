import type { Event, Task, ShoppingListItem, DogPlanItem, Location } from './types';
import { Timestamp } from 'firebase/firestore';

// This data is now only used for initial population and as a fallback.

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

// Note: The participant IDs here are placeholders.
// In a real app, these would be the actual Firestore user UIDs.
export const initialEvents: Event[] = [
  {
    id: 'evt1',
    title: 'Fußballtraining',
    start: new Date(new Date(today).setHours(17, 0, 0, 0)),
    end: new Date(new Date(today).setHours(18, 30, 0, 0)),
    participants: ['user-lukas'], 
    locationId: 'loc1',
  },
  {
    id: 'evt2',
    title: 'Zahnarzttermin',
    start: new Date(new Date(tomorrow).setHours(10, 0, 0, 0)),
    end: new Date(new Date(tomorrow).setHours(10, 30, 0, 0)),
    participants: ['user-lukas'],
    locationId: 'loc2'
  },
];

export const initialTasks: Task[] = [
    { id: 't1', title: 'Müll rausbringen', assignedTo: 'user-lukas', dueDate: today, priority: 'medium', completed: false, visibility: 'public', addedBy: 'user-lukas' },
    { id: 't2', title: 'Geschenk für Oma kaufen', assignedTo: 'user-lukas', dueDate: tomorrow, priority: 'high', completed: false, visibility: 'public', addedBy: 'user-lukas' },
];

export const initialShoppingListItems: ShoppingListItem[] = [
    { id: 's1', name: 'Milch', addedBy: 'user-lukas', purchased: false, assignedTo: '' },
    { id: 's2', name: 'Brot', addedBy: 'user-lukas', purchased: true, assignedTo: 'user-lukas' },
];

export const initialDogPlanItems: DogPlanItem[] = [
    { id: 'd_mo_m_init', day: 'Montag', timeOfDay: 'Morgen', assignedTo: 'user-lukas' },
    { id: 'd_mo_a_init', day: 'Montag', timeOfDay: 'Abend', assignedTo: 'user-lukas' },
];


// Mock iCal data for AI suggestions
export const familyICalData: Record<string, string[]> = {
    // This data needs to be dynamically generated based on actual user calendars
};
