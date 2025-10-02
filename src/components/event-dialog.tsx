'use client';

import React, { useState, useTransition, useEffect } from 'react';
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
import { CalendarIcon, Clock, Sparkles, Loader2, Users, FileText, MapPin } from 'lucide-react';
import { format, set, startOfDay, endOfDay, differenceInMinutes, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { FamilyMember, Event, CalendarGroup } from '@/lib/types';
import { getAISuggestions } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';

interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (event: Omit<Event, 'id' | 'calendarId'>) => void;
  event?: Event;
  allFamilyMembers: FamilyMember[];
  calendarGroups: CalendarGroup[];
}

export default function EventDialog({ isOpen, setIsOpen, onSave, event, allFamilyMembers, calendarGroups }: EventDialogProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [startDate, setStartDate] = useState<Date | undefined>(event?.start || new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(event?.end || event?.start || new Date());
  const [startTime, setStartTime] = useState(event ? format(event.start, 'HH:mm') : '10:00');
  const [endTime, setEndTime] = useState(event ? format(event.end, 'HH:mm') : '11:00');
  const [isAllDay, setIsAllDay] = useState(event?.allDay || false);
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(event?.participants || []);
  
  const [preferredTime, setPreferredTime] = useState('afternoon');
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof getAISuggestions>>['suggestions']>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSave = () => {
    if (!title || !startDate || !endDate) return;
    
    let startDateTime: Date;
    let endDateTime: Date;

    if (isAllDay) {
        startDateTime = startOfDay(startDate);
        endDateTime = endOfDay(endDate);
    } else {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        startDateTime = set(startDate, { hours: startHours, minutes: startMinutes, seconds: 0, milliseconds: 0 });
        endDateTime = set(endDate, { hours: endHours, minutes: endMinutes, seconds: 0, milliseconds: 0 });

        if(!isAfter(endDateTime, startDateTime)) {
            toast({ title: "Ungültiges Enddatum", description: "Das Ereignisende muss nach dem Beginn liegen.", variant: 'destructive' });
            return;
        }
    }


    onSave({
      title,
      start: startDateTime,
      end: endDateTime,
      location,
      description,
      participants: selectedParticipants,
      allDay: isAllDay,
    });
    setIsOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
      setTitle('');
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
      setStartTime('10:00');
      setEndTime('11:00');
      setIsAllDay(false);
      setLocation('');
      setDescription('');
      setSelectedParticipants([]);
      setSuggestions([]);
  }

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartDate(event.start);
      setEndDate(event.end);
      setStartTime(format(event.start, 'HH:mm'));
      setEndTime(format(event.end, 'HH:mm'));
      setIsAllDay(event.allDay || false);
      setLocation(event.location || '');
      setDescription(event.description || '');
      setSelectedParticipants(event.participants);
    } else {
      resetForm();
    }
  }, [event, isOpen]);

  useEffect(() => {
    if (startDate && (!endDate || endDate < startDate)) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);


  const handleGetSuggestions = () => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const sDate = new Date();
    sDate.setHours(startHours, startMinutes);
    const eDate = new Date();
    eDate.setHours(endHours, endMinutes);

    const duration = differenceInMinutes(eDate, sDate);

    if (duration <= 0) {
        toast({ title: "Ungültige Dauer", description: "Die Endzeit muss nach der Startzeit liegen, um Vorschläge zu erhalten.", variant: 'destructive' });
        return;
    }

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
  
  const applySuggestion = (startTimeISO: string, endTimeISO: string) => {
      const suggestedStartDate = new Date(startTimeISO);
      const suggestedEndDate = new Date(endTimeISO);
      setStartDate(suggestedStartDate);
      setEndDate(suggestedEndDate);
      setStartTime(format(suggestedStartDate, 'HH:mm'));
      setEndTime(format(suggestedEndDate, 'HH:mm'));
  }

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };
  
  const toggleGroup = (memberIds: readonly string[]) => {
    const allSelected = memberIds.every(id => selectedParticipants.includes(id));
    if (allSelected) {
      setSelectedParticipants(prev => prev.filter(id => !memberIds.includes(id)));
    } else {
      setSelectedParticipants(prev => [...new Set([...prev, ...memberIds])]);
    }
  }

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
                <Label className="text-right">{isAllDay ? 'Startdatum' : 'Von'}</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, 'PPP', { locale: de }) : <span>Wähle ein Datum</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                        </PopoverContent>
                    </Popover>
                     {!isAllDay && (
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="pl-9"/>
                        </div>
                     )}
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{isAllDay ? 'Enddatum' : 'Bis'}</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, 'PPP', { locale: de }) : <span>Wähle ein Datum</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={{ before: startDate }} initialFocus />
                        </PopoverContent>
                    </Popover>
                     {!isAllDay && (
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="pl-9"/>
                        </div>
                     )}
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <div/>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox id="all-day" checked={isAllDay} onCheckedChange={(checked) => setIsAllDay(Boolean(checked))} />
                  <label htmlFor="all-day" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Ganztägig
                  </label>
                </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right flex items-center gap-2 justify-end">
                <MapPin className="h-4 w-4" />
                Ort
              </Label>
              <div className="col-span-3">
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {location ? location : "Ort auswählen"}
                </Button>
              </div>
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
                        ? selectedParticipants.map(id => allFamilyMembers.find(p => p.id === id)?.name).join(', ')
                        : "Teilnehmer auswählen"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <div className="flex flex-col gap-1 p-2">
                    {calendarGroups.map(group => (
                      <React.Fragment key={group.id}>
                        <Label className="flex items-center gap-2 p-2 rounded-md hover:bg-accent font-semibold">
                          <Checkbox
                            checked={group.members.every(id => selectedParticipants.includes(id))}
                            onCheckedChange={() => toggleGroup(group.members)}
                          />
                          <span>{group.name}</span>
                        </Label>
                        <Separator />
                      </React.Fragment>
                    ))}
                    {allFamilyMembers.map(p => (
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

          {!isAllDay && (
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
                            <Button key={i} size="sm" variant="secondary" onClick={() => applySuggestion(s.startTime, s.endTime)}>
                                {format(new Date(s.startTime), 'HH:mm')} - {format(new Date(s.endTime), 'HH:mm')}
                            </Button>
                            ))}
                        </div>
                        </div>
                    )}
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Abbrechen</Button>
          <Button type="submit" onClick={handleSave}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    