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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import type { FamilyMember } from '@/lib/types';

interface ProfileDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (member: FamilyMember) => void;
  member: FamilyMember;
}

export default function ProfileDialog({ isOpen, setIsOpen, onSave, member }: ProfileDialogProps) {
  const [name, setName] = useState(member.name);
  const [selectedAvatar, setSelectedAvatar] = useState<ImagePlaceholder>(member.avatar);

  useEffect(() => {
    if (isOpen) {
      setName(member.name);
      setSelectedAvatar(member.avatar);
    }
  }, [isOpen, member]);

  const handleSave = () => {
    onSave({
      ...member,
      name,
      avatar: selectedAvatar,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil bearbeiten</DialogTitle>
          <DialogDescription>
            Ändere deinen Namen und wähle einen neuen Avatar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Avatar</Label>
            <div className="col-span-3">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAvatar.imageUrl} alt={name} data-ai-hint={selectedAvatar.imageHint} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">Wähle ein Bild aus der Liste unten aus.</p>
              </div>
              <ScrollArea className="h-48 rounded-md border">
                <div className="p-4 grid grid-cols-4 gap-4">
                  {PlaceHolderImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedAvatar(image)}
                      className={`rounded-full transition-all ${selectedAvatar.id === image.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={image.imageUrl} alt={image.description} data-ai-hint={image.imageHint} />
                      </Avatar>
                    </button>
                  ))}
                </div>
              </ScrollArea>
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
