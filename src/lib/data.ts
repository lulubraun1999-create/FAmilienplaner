import { PlaceHolderImages } from './placeholder-images';
import type { FamilyMember, CalendarGroup, Event, Task, ShoppingListItem, DogPlanItem } from './types';

const findImage = (id: string) => {
    const image = PlaceHolderImages.find(img => img.id === id);
    if (!image) throw new Error(`Image with id ${id} not found`);
    return image;
}

export const familyMembers: FamilyMember[] = [
  { id: 'dad', name: 'Papa', avatar: findImage('dad') },
  { id: 'mom', name: 'Mama', avatar: findImage('mom') },
  { id: 'sister', name: 'Schwester', avatar: findImage('sister') },
  { id: 'me', name: 'Ich', avatar: findImage('me') },
  { id: 'grandma', name: 'Oma', avatar: findImage('grandma') },
  { id: 'grandpa', name: 'Opa', avatar: findImage('grandpa') },
  { id: 'aunt', name: 'Tante', avatar: findImage('aunt') },
  { id: 'uncle', name: 'Onkel', avatar: findImage('uncle') },
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
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const events: Event[] = [
  {
    id: 'e1',
    title: 'Fußballtraining',
    start: new Date(today.setHours(17, 0, 0, 0)),
    end: new Date(today.setHours(18, 30, 0, 0)),
    location: 'Sportplatz',
    participants: ['sister'],
    calendarId: 'c_immediate',
  },
  {
    id: 'e2',
    title: 'Zahnarzttermin',
    start: new Date(tomorrow.setHours(10, 0, 0, 0)),
    end: new Date(tomorrow.setHours(10, 30, 0, 0)),
    location: 'Dr. Smile',
    participants: ['me'],
    calendarId: 'c_immediate',
  },
  {
    id: 'e3',
    title: 'Kaffeeklatsch',
    start: new Date(tomorrow.setHours(15, 0, 0, 0)),
    end: new Date(tomorrow.setHours(17, 0, 0, 0)),
    participants: ['grandma', 'grandpa'],
    calendarId: 'c_grandparents',
  },
   {
    id: 'e4',
    title: 'Elternabend',
    start: new Date(nextWeek.setHours(19, 0, 0, 0)),
    end: new Date(nextWeek.setHours(20, 0, 0, 0)),
    location: 'Schule',
    participants: ['dad', 'mom'],
    calendarId: 'c_immediate',
  },
];

export const tasks: Task[] = [
    { id: 't1', title: 'Müll rausbringen', assignedTo: 'sister', dueDate: today, priority: 'medium', completed: false, calendarId: 'c_immediate' },
    { id: 't2', title: 'Geschenk für Oma kaufen', assignedTo: 'me', dueDate: tomorrow, priority: 'high', completed: false, calendarId: 'c_immediate' },
    { id: 't3', title: 'Auto zur Werkstatt bringen', assignedTo: 'dad', dueDate: nextWeek, priority: 'medium', completed: false, calendarId: 'c_immediate' },
    { id: 't4', title: 'Blumen gießen', assignedTo: 'grandma', dueDate: today, priority: 'low', completed: true, calendarId: 'c_grandparents' },
];

export const shoppingListItems: ShoppingListItem[] = [
    { id: 's1', name: 'Milch', addedBy: 'mom', purchased: false, calendarId: 'c_immediate' },
    { id: 's2', name: 'Brot', addedBy: 'mom', purchased: true, calendarId: 'c_immediate' },
    { id: 's3', name: 'Eier', addedBy: 'dad', purchased: false, calendarId: 'c_immediate' },
    { id: 's4', name: 'Butter', addedBy: 'me', purchased: false, calendarId: 'c_immediate' },
    { id: 's5', name: 'Kaffee', addedBy: 'grandpa', purchased: false, calendarId: 'c_grandparents' },
];

export const dogPlanItems: DogPlanItem[] = [
    { id: 'd1', title: 'Morgens füttern', time: '07:00', assignedTo: 'dad', completed: true, calendarId: 'c_immediate' },
    { id: 'd2', title: 'Morgens Gassi gehen', time: '07:30', assignedTo: 'dad', completed: true, calendarId: 'c_immediate' },
    { id: 'd3', title: 'Abends füttern', time: '18:00', assignedTo: 'mom', completed: false, calendarId: 'c_immediate' },
    { id: 'd4', title: 'Abends Gassi gehen', time: '18:30', assignedTo: 'mom', completed: false, calendarId: 'c_immediate' },
];


// Mock iCal data for AI suggestions
export const familyICalData: Record<string, string[]> = {
    'Papa': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(nextWeek.setHours(19,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(nextWeek.setHours(20,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Elternabend\nEND:VEVENT\nEND:VCALENDAR`
    ],
    'Mama': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(nextWeek.setHours(19,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(nextWeek.setHours(20,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Elternabend\nEND:VEVENT\nEND:VCALENDAR`
    ],
    'Schwester': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(new Date().setHours(17,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(new Date().setHours(18,30,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Fußballtraining\nEND:VEVENT\nEND:VCALENDAR`
    ],
    'Ich': [
        `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10,0,0,0)).toISOString().replace(/[-:.]/g, '')}\nDTEND:${new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10,30,0,0)).toISOString().replace(/[-:.]/g, '')}\nSUMMARY:Zahnarzttermin\nEND:VEVENT\nEND:VCALENDAR`
    ],
};
