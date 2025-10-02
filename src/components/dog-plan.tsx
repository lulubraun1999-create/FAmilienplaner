'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { DogPlanItem, FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Plus, Clock } from 'lucide-react';

interface DogPlanProps {
  items: DogPlanItem[];
  members: FamilyMember[];
}

export default function DogPlan({ items, members }: DogPlanProps) {
    const [localItems, setLocalItems] = useState(items);
    
    const handleToggle = (itemId: string) => {
        setLocalItems(
            localItems.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            )
        );
    };

    const getMember = (memberId: string) => members.find(m => m.id === memberId);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hundeplan</CardTitle>
        <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {localItems.map((item) => {
            const member = getMember(item.assignedTo);
            return (
              <li key={item.id} className="flex items-center gap-4 rounded-md border p-3 transition-colors hover:bg-secondary/50">
                <Checkbox
                  id={`dog-item-${item.id}`}
                  checked={item.completed}
                  onCheckedChange={() => handleToggle(item.id)}
                  aria-label={`Mark item ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                />
                <div className="flex-1">
                  <label htmlFor={`dog-item-${item.id}`} className={cn("font-medium", item.completed && "text-muted-foreground line-through")}>
                    {item.title}
                  </label>
                  <p className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1.5 h-3 w-3" />
                    {item.time}
                  </p>
                </div>
                {member && (
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <span className='hidden sm:inline'>Zuständig:</span>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
