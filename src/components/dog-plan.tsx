'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { DogPlanItem, FamilyMember } from '@/lib/types';
import { cn, getInitials } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

interface DogPlanProps {
  items: DogPlanItem[];
  members: FamilyMember[];
  onUpdateItem: (item: DogPlanItem, isNew: boolean) => void;
}

type Weekday = 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag' | 'Sonntag';
type TimeOfDay = 'Morgen' | 'Mittag' | 'Abend';

const weekdays: Weekday[] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const timesOfDay: TimeOfDay[] = ['Morgen', 'Mittag', 'Abend'];
const UNASSIGNED_VALUE = 'unassigned';

export default function DogPlan({ items, members, onUpdateItem }: DogPlanProps) {
  const getMember = (memberId: string | undefined) => {
    if (!memberId) return null;
    return members.find(m => m.id === memberId);
  };
  
  const handleAssignmentChange = (weekday: Weekday, timeOfDay: TimeOfDay, memberId: string) => {
    const effectiveMemberId = memberId === UNASSIGNED_VALUE ? '' : memberId;
    const existingItem = items.find(item => item.day === weekday && item.timeOfDay === timeOfDay);

    if (existingItem) {
      // If the item exists, update or delete it
      onUpdateItem({ ...existingItem, assignedTo: effectiveMemberId }, false);
    } else if (effectiveMemberId) {
      // If the item does not exist and a member is being assigned, create it
      const newItem: DogPlanItem = {
        id: `d_${weekday}_${timeOfDay}_${new Date().getTime()}`, // Temporary ID for a new item
        day: weekday,
        timeOfDay: timeOfDay,
        assignedTo: effectiveMemberId,
      };
      onUpdateItem(newItem, true);
    }
    // If the item doesn't exist and no one is assigned, do nothing.
  };

  const getItemForSlot = (weekday: Weekday, timeOfDay: TimeOfDay) => {
    return items.find(item => item.day === weekday && item.timeOfDay === timeOfDay);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Hundeplan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-center">
            <thead>
              <tr className='border-b'>
                <th className="p-2 border-r"></th>
                {weekdays.map((day, index) => (
                  <th key={day} className={cn("p-2 font-medium", index < weekdays.length -1 && "border-r")}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timesOfDay.map(time => (
                <tr key={time} className='border-b'>
                  <td className="p-2 font-medium border-r">{time}</td>
                  {weekdays.map((day, index) => {
                    const item = getItemForSlot(day, time);
                    const member = getMember(item?.assignedTo);
                    return (
                      <td key={`${day}-${time}`} className={cn("p-2 min-w-[150px]", index < weekdays.length -1 && "border-r")}>
                        <Select
                            value={item?.assignedTo || UNASSIGNED_VALUE}
                            onValueChange={(memberId) => handleAssignmentChange(day, time, memberId)}
                        >
                            <SelectTrigger className={cn(!member && "text-muted-foreground")}>
                                <SelectValue placeholder="Nicht zugewiesen">
                                    {member ? (
                                        <div className='flex items-center gap-2'>
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                            </Avatar>
                                            <span>{member.name}</span>
                                        </div>
                                    ) : 'Nicht zugewiesen'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={UNASSIGNED_VALUE}>Nicht zugewiesen</SelectItem>
                                {members.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                        <div className='flex items-center gap-2'>
                                             <Avatar className="h-6 w-6">
                                                <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
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
