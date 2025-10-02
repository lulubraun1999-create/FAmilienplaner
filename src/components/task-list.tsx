'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { Task, FamilyMember } from '@/lib/types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  members: FamilyMember[];
}

const priorityMap: Record<Task['priority'], { label: string; className: string }> = {
  high: { label: 'Hoch', className: 'bg-red-500' },
  medium: { label: 'Mittel', className: 'bg-yellow-500' },
  low: { label: 'Niedrig', className: 'bg-green-500' },
};

export default function TaskList({ tasks, members }: TaskListProps) {
    const [localTasks, setLocalTasks] = useState(tasks);

    const handleToggle = (taskId: string) => {
        setLocalTasks(
            localTasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        );
    };

    const getMember = (memberId: string) => members.find(m => m.id === memberId);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aufgaben</CardTitle>
        <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Neue Aufgabe
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {localTasks.map((task) => {
            const member = getMember(task.assignedTo);
            return (
              <li key={task.id} className="flex items-center gap-4 rounded-md border p-3 transition-colors hover:bg-secondary/50">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.completed}
                  onCheckedChange={() => handleToggle(task.id)}
                  aria-label={`Mark task ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <div className="flex-1">
                  <label htmlFor={`task-${task.id}`} className={cn("font-medium", task.completed && "text-muted-foreground line-through")}>
                    {task.title}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Fällig am {format(task.dueDate, 'PPP', { locale: de })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", priorityMap[task.priority].className)}></span>
                        {priorityMap[task.priority].label}
                    </Badge>
                    {member && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
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
