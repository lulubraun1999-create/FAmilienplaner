'use server';

import type { Event } from '@/lib/types';
import ical from 'ical-generator';

export async function exportCalendar(events: Event[], familyName: string): Promise<string> {
    const calendar = ical({ name: `Vierklang Kalender: ${familyName}` });

    events.forEach(event => {
        calendar.createEvent({
            start: new Date(event.start.toString()),
            end: new Date(event.end.toString()),
            summary: event.title,
            description: event.description,
            allDay: event.allDay,
        });
    });

    return calendar.toString();
}
