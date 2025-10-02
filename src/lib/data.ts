import type { FamilyMember, CalendarGroup, Event, Task, ShoppingListItem, DogPlanItem, Location } from './types';
import { Timestamp } from 'firebase/firestore';

// This data is now only used for initial population and as a fallback.
// The primary source of truth for family members will be the /users collection in Firestore.
export const initialFamilyMembers: FamilyMember[] = [
  // This array is largely decorative now.
];

export const calendarGroups: CalendarGroup[] = [
  { id: 'c_butz_braun', name: 'Familie Butz/Braun', members: ['dad', 'mom', 'sister', 'me'] }, // IDs are now illustrative
  { id: 'c_froehle', name: 'Familie Fröhle', members: ['grandma', 'grandpa'] },
  { id: 'c_froehle_weiss', name: 'Familie Fröhle/Weiß', members: ['aunt', 'uncle'] },
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

// Note: The participant IDs here are placeholders.
// In a real app, these would be the actual Firestore user UIDs.
export const initialEvents: Event[] = [
  {
    id: 'evt1',
    title: 'Fußballtraining',
    start: new Date(new Date(today).setHours(17, 0, 0, 0)),
    end: new Date(new Date(today).setHours(18, 30, 0, 0)),
    participants: ['sister_placeholder_id'],
    locationId: 'loc1',
  },
  {
    id: 'evt2',
    title: 'Zahnarzttermin',
    start: new Date(new Date(tomorrow).setHours(10, 0, 0, 0)),
    end: new Date(new Date(tomorrow).setHours(10, 30, 0, 0)),
    participants: ['me_placeholder_id'],
    locationId: 'loc2'
  },
];

export const initialTasks: Task[] = [
    { id: 't1', title: 'Müll rausbringen', assignedTo: 'sister_placeholder_id', dueDate: today, priority: 'medium', completed: false, visibility: 'public', addedBy: 'mom_placeholder_id' },
    { id: 't2', title: 'Geschenk für Oma kaufen', assignedTo: 'me_placeholder_id', dueDate: tomorrow, priority: 'high', completed: false, visibility: 'public', addedBy: 'mom_placeholder_id' },
];

export const initialShoppingListItems: ShoppingListItem[] = [
    { id: 's1', name: 'Milch', addedBy: 'mom_placeholder_id', purchased: false, assignedTo: '' },
    { id: 's2', name: 'Brot', addedBy: 'mom_placeholder_id', purchased: true, assignedTo: 'mom_placeholder_id' },
];

export const initialDogPlanItems: DogPlanItem[] = [
    { id: 'd_mo_m_init', day: 'Montag', timeOfDay: 'Morgen', assignedTo: 'dad_placeholder_id' },
    { id: 'd_mo_a_init', day: 'Montag', timeOfDay: 'Abend', assignedTo: 'mom_placeholder_id' },
];


// Mock iCal data for AI suggestions
export const familyICalData: Record<string, string[]> = {
    // This data needs to be dynamically generated based on actual user calendars
};
