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
import { Avatar, AvatarFallback } from './ui/avatar';
import type { FamilyMember } from '@/lib/types';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';

interface ProfileDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (member: FamilyMember) => void;
  member: FamilyMember;
}

export default function ProfileDialog({ isOpen, setIsOpen, onSave, member }: ProfileDialogProps) {
  const [name, setName] = useState(member.name);
  const auth = useAuth();

  useEffect(() => {
    if (isOpen) {
      setName(member.name);
    }
  }, [isOpen, member]);

  const handleSave = () => {
    // Optimistically update the local state via onSave
    onSave({
      ...member,
      name,
    });
    
    // Update the profile in Firebase Auth
    if (auth.currentUser) {
      updateProfile(auth.currentUser, { displayName: name }).catch((error) => {
        // Handle potential errors, e.g., show a toast notification
        console.error("Error updating profile: ", error);
      });
    }
    
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profil bearbeiten</DialogTitle>
          <DialogDescription>
            Ändere deinen Namen. Dein Avatar wird aus deinen Initialen generiert.
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
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-2xl">{getInitials(name)}</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">Dein Avatar wird automatisch aus den Initialen deines Namens erstellt.</p>
              </div>
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
