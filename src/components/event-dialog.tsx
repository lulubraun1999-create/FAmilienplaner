'use client';

import React, { useState, useTransition } from 'react';
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
import { CalendarIcon, Clock, Sparkles, Loader2, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { FamilyMember, Event } from '@/lib/types';
import { getAISuggestions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';

interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (event: Omit<Event, 'id' | 'calendarId'>) => void;
  event?: Event;
  participants: FamilyMember[];
}

export default function EventDialog({ isOpen, setIsOpen, onSave, event, participants }: EventDialogProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [date, setDate] = useState<Date | undefined>(event?.start || new Date());
  const [startTime, setStartTime] = useState(event ? format(event.start, 'HH:mm') : '10:00');
  const [duration, setDuration] = useState(60); // in minutes
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(event?.participants || []);
  
  const [preferredTime, setPreferredTime] = useState('afternoon');
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof getAISuggestions>>['suggestions']>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSave = () => {
    if (!title || !date) return;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(date);
    startDateTime.setHours(hours, minutes);

    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    onSave({
      title,
      start: startDateTime,
      end: endDateTime,
      location,
      description,
      participants: selectedParticipants,
    });
    setIsOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
      setTitle('');
      setDate(new Date());
      setStartTime('10:00');
      setDuration(60);
      setLocation('');
      setDescription('');
      setSelectedParticipants([]);
      setSuggestions([]);
  }

  const handleGetSuggestions = () => {
    startTransition(async () => {
        const result = await getAISuggestions(duration, preferredTime);
        if (result.success) {
            setSuggestions(result.suggestions);
            if (result.suggestions && result.suggestions.length === 0) {
              toast({ title: "Keine Vorschläge", description: "KI konnte keine freien Zeitfenster finden." });
            }
        } else {
            toast({ title: "Fehler", description: result.error, variant: 'destructive' });
        }
    });
  };
  
  const applySuggestion = (startTimeISO: string) => {
      const suggestedDate = new Date(startTimeISO);
      setDate(suggestedDate);
      setStartTime(format(suggestedDate, 'HH:mm'));
  }

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Ereignis bearbeiten' : 'Neues Ereignis erstellen'}</DialogTitle>
          <DialogDescription>
            Fülle die Details für dein Ereignis aus. Klicke auf Speichern, wenn du fertig bist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">Titel</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Datum & Uhrzeit</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'PPP', { locale: de }) : <span>Wähle ein Datum</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                </Popover>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="pl-9"/>
                </div>
            </div>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">Dauer (Minuten)</Label>
              <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">Ort</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2 flex items-center gap-2 justify-end">
              <Users className="h-4 w-4"/>
              Teilnehmer
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <span className="truncate">
                      {selectedParticipants.length > 0 
                        ? selectedParticipants.map(id => participants.find(p => p.id === id)?.name).join(', ')
                        : "Teilnehmer auswählen"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="flex flex-col gap-1 p-2">
                    {participants.map(p => (
                      <Label key={p.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                        <Checkbox 
                          checked={selectedParticipants.includes(p.id)}
                          onCheckedChange={() => toggleParticipant(p.id)}
                        />
                         <Avatar className="h-6 w-6">
                          <AvatarImage src={p.avatar.imageUrl} alt={p.name} data-ai-hint={p.avatar.imageHint}/>
                          <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{p.name}</span>
                      </Label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2 flex items-center gap-2 justify-end">
                <FileText className="h-4 w-4" />
                Beschreibung
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">KI-Vorschläge</Label>
            <div className="col-span-3 space-y-2">
                <div className='grid grid-cols-2 gap-2'>
                    <Select value={preferredTime} onValueChange={setPreferredTime}>
                        <SelectTrigger>
                            <SelectValue placeholder="Bevorzugte Zeit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="morning">Morgens</SelectItem>
                            <SelectItem value="afternoon">Nachmittags</SelectItem>
                            <SelectItem value="evening">Abends</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleGetSuggestions} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Zeit vorschlagen
                    </Button>
                </div>
                {suggestions && suggestions.length > 0 && (
                    <div className="space-y-2 rounded-md border p-2">
                       <Label className="text-xs text-muted-foreground">Vorschläge:</Label>
                       <div className='flex flex-wrap gap-2'>
                        {suggestions.map((s, i) => (
                           <Button key={i} size="sm" variant="secondary" onClick={() => applySuggestion(s.startTime)}>
                               {format(new Date(s.startTime), 'HH:mm')}
                           </Button>
                        ))}
                       </div>
                    </div>
                )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Abbrechen</Button>
          <Button type="submit" onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
