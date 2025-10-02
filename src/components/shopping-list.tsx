'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { ShoppingListItem, FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from './ui/input';

interface ShoppingListProps {
  items: ShoppingListItem[];
  members: FamilyMember[];
  onAddItem: (itemName: string) => void;
  onUpdateItem: (itemId: string, purchased: boolean) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function ShoppingList({ items, members, onAddItem, onUpdateItem, onDeleteItem }: ShoppingListProps) {
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNewItem = () => {
    if (newItemName.trim()) {
      onAddItem(newItemName.trim());
      setNewItemName('');
      setIsAdding(false);
    }
  };

  const getMember = (memberId: string) => members.find(m => m.id === memberId);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Einkaufsliste</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Artikel
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="flex gap-2 mb-4">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Was wird benötigt?"
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewItem()}
              autoFocus
            />
            <Button onClick={handleAddNewItem}>Hinzufügen</Button>
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Abbrechen</Button>
          </div>
        )}
        <ul className="space-y-4">
          {items.map((item) => {
            const member = getMember(item.addedBy);
            return (
              <li key={item.id} className="flex items-center gap-4 rounded-md border p-3 transition-colors hover:bg-secondary/50">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.purchased}
                  onCheckedChange={(checked) => onUpdateItem(item.id, Boolean(checked))}
                  aria-label={`Mark item ${item.name} as ${item.purchased ? 'not purchased' : 'purchased'}`}
                />
                <div className="flex-1">
                  <label htmlFor={`item-${item.id}`} className={cn("font-medium", item.purchased && "text-muted-foreground line-through")}>
                    {item.name}
                  </label>
                </div>
                <div className='flex items-center gap-4'>
                    {member && (
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <span className='hidden sm:inline'>Von</span>
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </li>
            );
          })}
        </ul>
        {items.length === 0 && !isAdding && (
            <p className="text-center text-sm text-muted-foreground py-8">Die Einkaufsliste ist leer.</p>
        )}
      </CardContent>
    </Card>
  );
}
    