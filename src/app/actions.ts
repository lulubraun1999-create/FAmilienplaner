'use server';

import { suggestOptimalEventTimes, type SuggestOptimalEventTimesInput, type SuggestOptimalEventTimesOutput } from '@/ai/flows/suggest-optimal-event-times';
import { familyICalData } from '@/lib/data';
import type { Event } from '@/lib/types';
import ical from 'ical-generator';

export async function getAISuggestions(
    duration: number,
    preferredTime: string
): Promise<{ success: true; suggestions: SuggestOptimalEventTimesOutput['suggestedEventTimes'] } | { success: false; error: string }> {
    try {
        if (!process.env.GENKIT_ENV) {
            console.warn("GENKIT_ENV is not set, AI suggestions will be mocked.");
            // Mock response for local development without Genkit configured
            const mockSuggestions = [
                { startTime: new Date(Date.now() + 3600 * 1000).toISOString(), endTime: new Date(Date.now() + (3600 + duration * 60) * 1000).toISOString(), confidence: 0.95 },
                { startTime: new Date(Date.now() + 7200 * 1000).toISOString(), endTime: new Date(Date.now() + (7200 + duration * 60) * 1000).toISOString(), confidence: 0.90 },
                { startTime: new Date(Date.now() + 10800 * 1000).toISOString(), endTime: new Date(Date.now() + (10800 + duration * 60) * 1000).toISOString(), confidence: 0.85 },
            ];
            return { success: true, suggestions: mockSuggestions };
        }

        const input: SuggestOptimalEventTimesInput = {
            familyCalendars: familyICalData,
            newEventDurationMinutes: duration,
            preferredTimeOfDay: preferredTime,
        };
        const result = await suggestOptimalEventTimes(input);
        
        if (!result.suggestedEventTimes || result.suggestedEventTimes.length === 0) {
          return { success: false; error: 'AI could not suggest any time slots.' };
        }

        return { success: true, suggestions: result.suggestedEventTimes };
    } catch (error) {
        console.error('Error getting AI suggestions:', error);
        return { success: false, error: 'Failed to get AI suggestions.' };
    }
}

export async function exportCalendar(events: Event[], familyName: string): Promise<string> {
    const calendar = ical({ name: `Familienkalender: ${familyName}` });

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
