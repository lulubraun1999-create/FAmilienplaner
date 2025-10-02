'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { DogPlanItem, FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface DogPlanProps {
  items: DogPlanItem[];
  members: FamilyMember[];
}

type Weekday = 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag' | 'Sonntag';
type TimeOfDay = 'Morgen' | 'Mittag' | 'Abend';

const weekdays: Weekday[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const timesOfDay: TimeOfDay[] = ['Morgen', 'Mittag', 'Abend'];

export default function DogPlan({ items, members }: DogPlanProps) {
  const [localItems, setLocalItems] = useState(items);

  const getMember = (memberId: string | null) => {
    if (!memberId) return null;
    return members.find(m => m.id === memberId);
  };
  
  const handleAssignmentChange = (weekday: Weekday, timeOfDay: TimeOfDay, memberId: string) => {
    setLocalItems(prevItems => {
        const newItems = [...prevItems];
        const itemIndex = newItems.findIndex(item => item.day === weekday && item.timeOfDay === timeOfDay);

        if (itemIndex > -1) {
            newItems[itemIndex] = { ...newItems[itemIndex], assignedTo: memberId };
        } else {
            newItems.push({
                id: `d_${weekday}_${timeOfDay}`,
                day: weekday,
                timeOfDay: timeOfDay,
                assignedTo: memberId,
                calendarId: 'c_immediate' // Assuming a default
            });
        }
        return newItems;
    });
  };

  const getItemForSlot = (weekday: Weekday, timeOfDay: TimeOfDay) => {
    return localItems.find(item => item.day === weekday && item.timeOfDay === timeOfDay);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Hundeplan - Gassi gehen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className='border-b'>
                <th className="p-2 border-r"></th>
                {weekdays.map(day => (
                  <th key={day} className="p-2 font-medium">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timesOfDay.map(time => (
                <tr key={time} className='border-b'>
                  <td className="p-2 font-medium border-r">{time}</td>
                  {weekdays.map(day => {
                    const item = getItemForSlot(day, time);
                    const member = getMember(item?.assignedTo || null);
                    return (
                      <td key={`${day}-${time}`} className="p-2 min-w-[150px]">
                        <Select
                            value={member?.id || ''}
                            onValueChange={(memberId) => handleAssignmentChange(day, time, memberId)}
                        >
                            <SelectTrigger className={cn(!member && "text-muted-foreground")}>
                                <SelectValue>
                                    {member ? (
                                        <div className='flex items-center gap-2'>
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{member.name}</span>
                                        </div>
                                    ) : 'Nicht zugewiesen'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Nicht zugewiesen</SelectItem>
                                {members.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                        <div className='flex items-center gap-2'>
                                             <Avatar className="h-6 w-6">
                                                <AvatarImage src={m.avatar.imageUrl} alt={m.name} data-ai-hint={m.avatar.imageHint} />
                                                <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{m.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
