import type { PlaceHolderImages } from "./placeholder-images";

export type FamilyMember = {
  id: string;
  name: string;
  avatar: (typeof PlaceHolderImages)[number];
};

export type CalendarGroup = {
  id: string;
  name: string;
  members: FamilyMember['id'][];
};

export type Event = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  participants: FamilyMember['id'][];
  calendarId: CalendarGroup['id'];
};

export type Task = {
  id: string;
  title: string;
  assignedTo: FamilyMember['id'];
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  calendarId: CalendarGroup['id'];
};

export type ShoppingListItem = {
  id: string;
  name: string;
  addedBy: FamilyMember['id'];
  purchased: boolean;
  calendarId: CalendarGroup['id'];
};

export type DogPlanItem = {
  id: string;
  title: string;
  time: string;
  assignedTo: FamilyMember['id'];
  completed: boolean;
  calendarId: CalendarGroup['id'];
};
