import type { Event, Task, ShoppingListItem, DogPlanItem, Location } from './types';
import { Timestamp } from 'firebase/firestore';

// This data is now only used for initial population and as a fallback.

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

export const initialEvents: Omit<Event, 'id'>[] = [
  // Empty as requested
];

export const initialTasks: Omit<Task, 'id'>[] = [
    { title: 'Müll rausbringen', assignedTo: 'user-lukas', dueDate: today, priority: 'medium', completed: false, visibility: 'public', addedBy: 'user-lukas' },
    { title: 'Geschenk für Oma kaufen', assignedTo: 'user-lukas', dueDate: tomorrow, priority: 'high', completed: false, visibility: 'public', addedBy: 'user-lukas' },
];

export const initialShoppingListItems: Omit<ShoppingListItem, 'id'>[] = [
    { name: 'Milch', addedBy: 'user-lukas', purchased: false, assignedTo: '' },
    { name: 'Brot', addedBy: 'user-lukas', purchased: true, assignedTo: 'user-lukas' },
];

export const initialDogPlanItems: Omit<DogPlanItem, 'id'>[] = [
    { day: 'Montag', timeOfDay: 'Morgen', assignedTo: 'user-lukas' },
    { day: 'Montag', timeOfDay: 'Abend', assignedTo: 'user-lukas' },
];


// Mock iCal data for AI suggestions
export const familyICalData: Record<string, string[]> = {
    // This data needs to be dynamically generated based on actual user calendars
};
