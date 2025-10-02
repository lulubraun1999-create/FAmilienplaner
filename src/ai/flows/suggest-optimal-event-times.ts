'use server';

/**
 * @fileOverview Suggests optimal times for new events, considering existing schedules to avoid conflicts.
 *
 * - suggestOptimalEventTimes - A function that suggests optimal event times.
 * - SuggestOptimalEventTimesInput - The input type for the suggestOptimalEventTimes function.
 * - SuggestOptimalEventTimesOutput - The return type for the suggestOptimalEventTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalEventTimesInputSchema = z.object({
  familyCalendars: z.record(z.string(), z.array(z.string())).describe('A record of family member names to an array of their calendar events (iCalendar format).'),
  newEventDurationMinutes: z.number().describe('The duration of the new event in minutes.'),
  preferredTimeOfDay: z.string().optional().describe('The preferred time of day for the event (e.g., morning, afternoon, evening).'),
});
export type SuggestOptimalEventTimesInput = z.infer<typeof SuggestOptimalEventTimesInputSchema>;

const SuggestOptimalEventTimesOutputSchema = z.object({
  suggestedEventTimes: z.array(
    z.object({
      startTime: z.string().describe('The suggested start time for the event (ISO format).'),
      endTime: z.string().describe('The suggested end time for the event (ISO format).'),
      confidence: z.number().describe('A confidence score (0-1) indicating the likelihood of no conflicts.'),
    })
  ).describe('An array of suggested event times, considering existing schedules.'),
});
export type SuggestOptimalEventTimesOutput = z.infer<typeof SuggestOptimalEventTimesOutputSchema>;

export async function suggestOptimalEventTimes(input: SuggestOptimalEventTimesInput): Promise<SuggestOptimalEventTimesOutput> {
  return suggestOptimalEventTimesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalEventTimesPrompt',
  input: {schema: SuggestOptimalEventTimesInputSchema},
  output: {schema: SuggestOptimalEventTimesOutputSchema},
  prompt: `You are an AI assistant that suggests optimal times for scheduling new events for families, considering their existing calendars.

  Given the following family member calendars and the desired event duration, suggest a few optimal times for the new event to avoid conflicts.
  Each family member is associated with an array of iCalendar events (RFC5545 format).
  Consider the preferred time of day if provided; otherwise, suggest times throughout the day.

  Family Calendars:
  {{#each familyCalendars}}
    {{@key}}:
    {{#each this}}
      - {{this}}
    {{/each}}
  {{/each}}

  Event Duration: {{newEventDurationMinutes}} minutes
  Preferred Time of Day: {{preferredTimeOfDay}}

  Output should be an array of suggested event times in ISO format, with a confidence score (0-1) indicating the likelihood of no conflicts. Be sure to generate times in ISO format. Make sure you provide at least 3 options, and try your best to make sure there are no conflicts.
  Also, make sure to fill out the confidence score appropriately. Try to put the best options first.
  The endTime must be after the startTime, based on the event duration.
  {
    "suggestedEventTimes": [
      {
        "startTime": "2024-01-01T10:00:00Z",
        "endTime": "2024-01-01T11:00:00Z",
        "confidence": 0.95
      }
    ]
  }
  `,
});

const suggestOptimalEventTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalEventTimesFlow',
    inputSchema: SuggestOptimalEventTimesInputSchema,
    outputSchema: SuggestOptimalEventTimesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
