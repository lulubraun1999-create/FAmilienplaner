'use client';

import React, { useState, useTransition, useEffect, useMemo } from 'react';
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
import { CalendarIcon, Clock, Sparkles, Loader2, Users, FileText, MapPin, Trash2, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { format, set, startOfDay, endOfDay, differenceInMinutes, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn, getInitials } from '@/lib/utils';
import type { FamilyMember, Event, CalendarGroup, Location, EventParticipant, ParticipantStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import LocationDialog from './location-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface EventDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (event: Omit<Event, 'id'> | Event) => void;
  onDelete: (eventId: string) => void;
  event?: Event;
  allFamilyMembers: FamilyMember[];
  calendarGroups: CalendarGroup[];
  locations: Location[];
  onAddLocation: (location: Omit<Location, 'id'>) => Promise<string>;
  onDeleteLocation: (locationId: string) => void;
  me: FamilyMember | undefined;
}

const statusIcons: Record<ParticipantStatus, React.ElementType> = {
    accepted: CheckCircle,
    declined: XCircle,
    pending: HelpCircle
};

const statusColors: Record<ParticipantStatus, string> = {
    accepted: 'text-green-500',
    declined: 'text-red-500',
    pending: 'text-yellow-500'
};

export default function EventDialog({ isOpen, setIsOpen, onSave, onDelete, event, allFamilyMembers, calendarGroups, locations, onAddLocation, onDeleteLocation, me }: EventDialogProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [isAllDay, setIsAllDay] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  
  const { toast } = useToast();
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  

  const resetForm = () => {
      setTitle('');
      const today = new Date();
      setStartDate(today);
      setEndDate(today);
      setStartTime('10:00');
      setEndTime('11:00');
      setIsAllDay(false);
      setLocationId('');
      setDescription('');
      setParticipants(me ? [{ userId: me.id, status: 'accepted' }] : []);
  }

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setTitle(event.title);
        setStartDate(event.start ? new Date(event.start.toString()) : new Date());
        setEndDate(event.end ? new Date(event.end.toString()) : new Date());
        setStartTime(format(new Date(event.start.toString()), 'HH:mm'));
        setEndTime(format(new Date(event.end.toString()), 'HH:mm'));
        setIsAllDay(event.allDay || false);
        setLocationId(event.locationId || '');
        setDescription(event.description || '');
        setParticipants(event.participants ? [...event.participants] : []);
      } else {
        resetForm();
      }
    }
  }, [event, isOpen, me]);
  
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

    const eventData = {
      title,
      start: startDateTime,
      end: endDateTime,
      locationId,
      description,
      participants,
      allDay: isAllDay,
      createdBy: event?.createdBy || me?.id || ''
    };

    if (event?.id) {
        onSave({ id: event.id, ...eventData });
    } else {
        onSave(eventData);
    }
    
    setIsOpen(false);
  };

  useEffect(() => {
    if (startDate && (!endDate || endDate < startDate)) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const handleDelete = () => {
    if (event?.id) {
      onDelete(event.id);
      setIsOpen(false);
    }
  }

  const toggleParticipant = (participantId: string) => {
    setParticipants(prev => {
        const isAlreadyParticipant = prev.some(p => p.userId === participantId);
        if (isAlreadyParticipant) {
            return prev.filter(p => p.userId !== participantId);
        } else {
            const status: ParticipantStatus = participantId === me?.id ? 'accepted' : 'pending';
            return [...prev, { userId: participantId, status }];
        }
    });
  };
  
  const toggleGroup = (memberIds: readonly string[]) => {
      if (memberIds.length === 0) return;
      const participantIds = new Set(participants.map(p => p.userId));
      const allMembersInGroupAreParticipants = memberIds.every(id => participantIds.has(id));

      if (allMembersInGroupAreParticipants) {
          // Deselect all members of this group
          setParticipants(prev => prev.filter(p => !memberIds.includes(p.userId)));
      } else {
          // Select all members of this group that are not already participants
          const newParticipants = memberIds
              .filter(id => !participantIds.has(id))
              .map(id => ({ userId: id, status: (id === me?.id ? 'accepted' : 'pending') as ParticipantStatus }));
          setParticipants(prev => [...prev, ...newParticipants]);
      }
  };

  const handleStatusChange = (userId: string, status: ParticipantStatus) => {
    setParticipants(prev => prev.map(p => p.userId === userId ? { ...p, status } : p));
  };


  const selectedLocationName = locations.find(l => l.id === locationId)?.name || "Ort auswählen";

  const getGroupMembers = (group: CalendarGroup) => {
      if (group.id === 'all') {
          return allFamilyMembers.map(m => m.id);
      }
      return group.members;
  };
  
  const isGroupSelected = useMemo(() => (group: CalendarGroup) => {
      const memberIds = getGroupMembers(group);
      if (memberIds.length === 0) return false;
      const participantIds = new Set(participants.map(p => p.userId));
      return memberIds.every(id => participantIds.has(id));
  }, [participants, allFamilyMembers, getGroupMembers]);

  return (
    <>
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
                  <Button variant="outline" className="w-full justify-start text-left font-normal" onClick={() => setIsLocationDialogOpen(true)}>
                    {selectedLocationName}
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
                        {participants.length > 0 
                          ? participants.map(p => allFamilyMembers.find(member => member.id === p.userId)?.name).join(', ')
                          : "Teilnehmer auswählen"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <div className="flex flex-col gap-1 p-2">
                       {calendarGroups.map(group => {
                            const memberIds = getGroupMembers(group);
                            return (
                                <React.Fragment key={group.id}>
                                    <Label className="flex items-center gap-2 p-2 rounded-md hover:bg-accent font-semibold">
                                        <Checkbox
                                            checked={isGroupSelected(group)}
                                            onCheckedChange={() => toggleGroup(memberIds)}
                                        />
                                        <span>{group.name}</span>
                                    </Label>
                                    <Separator />
                                </React.Fragment>
                            );
                        })}
                      {allFamilyMembers.map(p => (
                        <Label key={p.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                          <Checkbox 
                            checked={participants.some(par => par.userId === p.id)}
                            onCheckedChange={() => toggleParticipant(p.id)}
                          />
                           <Avatar className="h-6 w-6">
                            <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                          </Avatar>
                          <span>{p.name}</span>
                        </Label>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

             {participants.length > 0 && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Status</Label>
                  <div className="col-span-3 space-y-2">
                    {participants.map(p => {
                      const member = allFamilyMembers.find(m => m.id === p.userId);
                      if (!member) return null;
                      const StatusIcon = statusIcons[p.status];
                      return (
                        <div key={p.userId} className="flex items-center justify-between gap-2">
                           <div className="flex items-center gap-2">
                             <Avatar className="h-6 w-6">
                               <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                             </Avatar>
                             <span>{member.name}</span>
                           </div>
                           {p.userId === me?.id ? (
                               <div className="flex items-center gap-1">
                                <Button size="sm" variant={p.status === 'accepted' ? 'default' : 'ghost'} onClick={() => handleStatusChange(p.userId, 'accepted')}>Zusagen</Button>
                                <Button size="sm" variant={p.status === 'declined' ? 'destructive' : 'ghost'} onClick={() => handleStatusChange(p.userId, 'declined')}>Absagen</Button>
                               </div>
                           ) : (
                            <div className="flex items-center gap-2">
                                <StatusIcon className={cn("h-5 w-5", statusColors[p.status])} />
                                <span className='text-sm capitalize'>{p.status === 'pending' ? 'Ausstehend' : (p.status === 'accepted' ? 'Zugesagt' : 'Abgesagt')}</span>
                           </div>
                           )}
                        </div>
                      )
                    })}
                  </div>
                </div>
            )}
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2 flex items-center gap-2 justify-end">
                  <FileText className="h-4 w-4" />
                  Beschreibung
              </Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>

          </div>
          <DialogFooter className='justify-between'>
            <div>
            {event && event.createdBy === me?.id && (
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
                      Diese Aktion kann nicht rückgängig gemacht werden. Dadurch wird das Ereignis dauerhaft gelöscht.
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
            <div className='flex gap-2'>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Abbrechen</Button>
              <Button type="submit" onClick={handleSave}>Speichern</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LocationDialog
        isOpen={isLocationDialogOpen}
        setIsOpen={setIsLocationDialogOpen}
        locations={locations}
        onAddLocation={onAddLocation}
        onSelectLocation={(locationId) => {
          setLocationId(locationId);
          setIsLocationDialogOpen(false);
        }}
        onDeleteLocation={onDeleteLocation}
      />
    </>
  );
}
