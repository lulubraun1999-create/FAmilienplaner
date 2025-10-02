import type { PlaceHolderImages } from "./placeholder-images";
import { Timestamp } from "firebase/firestore";

export type FamilyMember = {
  id: string;
  name: string;
  avatar: (typeof PlaceHolderImages)[number];
};

export type CalendarGroup = {
  id: string;
  name: string;
  members: readonly FamilyMember['id'][];
};

export type Location = {
    id: string;
    name: string;
    street: string;
    housenumber: string;
    postalcode: string;
    city: string;
}

export type Event = {
  id: string;
  title: string;
  start: Timestamp | Date;
  end: Timestamp | Date;
  allDay?: boolean;
  locationId?: string;
  description?: string;
  participants: readonly FamilyMember['id'][];
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  assignedTo: FamilyMember['id'];
  dueDate: Timestamp | Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
};

export type ShoppingListItem = {
  id: string;
  name: string;
  addedBy: FamilyMember['id'];
  purchased: boolean;
};

export type DogPlanItem = {
  id: string;
  day: 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag' | 'Sonntag';
  timeOfDay: 'Morgen' | 'Mittag' | 'Abend';
  assignedTo: FamilyMember['id'];
  calendarId?: string;
};
