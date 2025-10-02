'use client';

import React, { useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';
import type { Location } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface LocationDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  locations: Location[];
  onAddLocation: (location: Omit<Location, 'id'>) => Promise<string>;
  onSelectLocation: (locationId: string) => void;
  onDeleteLocation: (locationId: string) => void;
}

export default function LocationDialog({ isOpen, setIsOpen, locations, onAddLocation, onSelectLocation, onDeleteLocation }: LocationDialogProps) {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [housenumber, setHousenumber] = useState('');
  const [postalcode, setPostalcode] = useState('');
  const [city, setCity] = useState('');

  const handleAddLocation = async () => {
    if (!name || !street || !housenumber || !postalcode || !city) {
      // Basic validation
      alert('Bitte fülle alle Felder aus.');
      return;
    }
    const newLocation = { name, street, housenumber, postalcode, city };
    const newId = await onAddLocation(newLocation);
    onSelectLocation(newId);
    
    // Reset form
    setName('');
    setStreet('');
    setHousenumber('');
    setPostalcode('');
    setCity('');
  };
  
  const handleLocationClick = (locationId: string) => {
    onSelectLocation(locationId);
    setIsOpen(false);
  }

  const handleDeleteClick = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation(); // Prevent the click from selecting the location
    onDeleteLocation(locationId);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ort auswählen oder erstellen</DialogTitle>
          <DialogDescription>
            Wähle einen gespeicherten Ort aus der Liste oder füge einen neuen hinzu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <h3 className="text-sm font-medium text-muted-foreground">Gespeicherte Orte</h3>
            <ScrollArea className="h-48 rounded-md border">
                <div className="p-2">
                    {locations.length > 0 ? (
                        locations.map(loc => (
                            <div 
                                key={loc.id} 
                                className="w-full text-left p-2 rounded-md hover:bg-accent flex justify-between items-center group"
                            >
                                <button className='text-left flex-grow' onClick={() => handleLocationClick(loc.id)}>
                                    <p className="font-semibold">{loc.name}</p>
                                    <p className="text-sm text-muted-foreground">{loc.street} {loc.housenumber}, {loc.postalcode} {loc.city}</p>
                                </button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Bist du sicher?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Diese Aktion kann nicht rückgängig gemacht werden. Der Ort '{loc.name}' wird dauerhaft gelöscht.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={(e) => handleDeleteClick(e, loc.id)}>Löschen</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-sm text-muted-foreground">Noch keine Orte gespeichert.</p>
                    )}
                </div>
            </ScrollArea>
            
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="new-location">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Neuen Ort hinzufügen
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="loc-name" className="text-right">Name</Label>
                                <Input id="loc-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="z.B. Zuhause, Arbeit"/>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="loc-street" className="text-right">Straße</Label>
                                <Input id="loc-street" value={street} onChange={(e) => setStreet(e.target.value)} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="loc-housenumber" className="text-right">Nr.</Label>
                                <Input id="loc-housenumber" value={housenumber} onChange={(e) => setHousenumber(e.target.value)} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="loc-postalcode" className="text-right">PLZ</Label>
                                <Input id="loc-postalcode" value={postalcode} onChange={(e) => setPostalcode(e.target.value)} className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="loc-city" className="text-right">Stadt</Label>
                                <Input id="loc-city" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-3" />
                            </div>
                             <div className="flex justify-end">
                                <Button onClick={handleAddLocation}>Ort speichern & auswählen</Button>
                             </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
