'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { FamilyMember, Task } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface TaskDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
  onDelete: (taskId: string) => void;
  task?: Task;
  familyMembers: FamilyMember[];
}

export default function TaskDialog({ isOpen, setIsOpen, onSave, onDelete, task, familyMembers }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [visibility, setVisibility] = useState<Task['visibility']>('public');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setAssignedTo('');
    setPriority('medium');
    setVisibility('public');
  };

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueDate(task.dueDate ? new Date(task.dueDate.toString()) : new Date());
        setAssignedTo(task.assignedTo);
        setPriority(task.priority);
        setVisibility(task.visibility || 'public');
      } else {
        resetForm();
      }
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (!title || !dueDate || !assignedTo) return;

    const taskData = {
      title,
      description,
      dueDate,
      assignedTo,
      priority,
      completed: task?.completed || false,
      visibility,
    };

    if (task?.id) {
      onSave({ id: task.id, ...taskData });
    } else {
      onSave(taskData);
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (task?.id) {
      onDelete(task.id);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}</DialogTitle>
          <DialogDescription>
            Fülle die Details für die Aufgabe aus. Klicke auf Speichern, wenn du fertig bist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-title" className="text-right">Titel</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="task-description" className="text-right pt-2">Beschreibung</Label>
            <Textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-dueDate" className="text-right">Fällig am</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP', { locale: de }) : <span>Wähle ein Datum</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-priority" className="text-right">Priorität</Label>
            <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Priorität auswählen" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Zugewiesen an</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Person auswählen" />
              </SelectTrigger>
              <SelectContent>
                {familyMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2 flex items-center gap-2 justify-end">
                <Eye className="h-4 w-4" />
                Sichtbarkeit
            </Label>
            <RadioGroup value={visibility} onValueChange={(value: Task['visibility']) => setVisibility(value)} className="col-span-3 pt-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="vis-public" />
                    <Label htmlFor="vis-public">Öffentlich (Alle Familienmitglieder)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="vis-private" />
                    <Label htmlFor="vis-private">Privat (nur für die zugewiesene Person)</Label>
                </div>
            </RadioGroup>
          </div>

        </div>
        <DialogFooter className='justify-between'>
          <div>
            {task && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" type="button">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Löschen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird die Aufgabe dauerhaft gelöscht.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Abbrechen</Button>
            <Button type="submit" onClick={handleSave}>Speichern</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
