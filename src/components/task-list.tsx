'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { Task, FamilyMember } from '@/lib/types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn, getInitials } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

interface TaskListProps {
  tasks: Task[];
  members: FamilyMember[];
  onTaskClick: (task: Task) => void;
  onNewTaskClick: () => void;
}

const priorityMap: Record<Task['priority'], { label: string; className: string }> = {
  high: { label: 'Hoch', className: 'bg-red-500' },
  medium: { label: 'Mittel', className: 'bg-yellow-500' },
  low: { label: 'Niedrig', className: 'bg-green-500' },
};

export default function TaskList({ tasks, members, onTaskClick, onNewTaskClick }: TaskListProps) {
    const { firestore } = useFirebase();

    const handleToggle = (task: Task) => {
        if(firestore) {
            const taskRef = doc(firestore, `families/Familie-Butz-Braun/tasks/${task.id}`);
            updateDoc(taskRef, { completed: !task.completed });
        }
    };

    const getMember = (memberId: string) => members.find(m => m.id === memberId);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aufgaben</CardTitle>
        <Button size="sm" variant="outline" onClick={onNewTaskClick}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {tasks.map((task) => {
            const member = getMember(task.assignedTo);
            return (
              <li key={task.id} className="flex items-center gap-4 rounded-md border p-3 transition-colors hover:bg-secondary/50">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggle(task)}
                  aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <button className='flex-1 text-left' onClick={() => onTaskClick(task)}>
                    <div className="flex-1">
                    <label htmlFor={`task-${task.id}`} className={cn("font-medium cursor-pointer", task.completed && "text-muted-foreground line-through")}>
                        {task.title}
                    </label>
                    <p className="text-sm text-muted-foreground">
                        Fällig am {format(task.dueDate, 'PPP', { locale: de })}
                    </p>
                    </div>
                </button>
                <div className="flex items-center gap-2" onClick={() => onTaskClick(task)}>
                    <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", priorityMap[task.priority].className)}></span>
                        {priorityMap[task.priority].label}
                    </Badge>
                    {member && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
