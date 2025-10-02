'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { ShoppingListItem, FamilyMember } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingListItem[];
  members: FamilyMember[];
}

export default function ShoppingList({ items, members }: ShoppingListProps) {
    const [localItems, setLocalItems] = useState(items);
    
    const handleToggle = (itemId: string) => {
        setLocalItems(
            localItems.map(item =>
                item.id === itemId ? { ...item, purchased: !item.purchased } : item
            )
        );
    };

    const getMember = (memberId: string) => members.find(m => m.id === memberId);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Einkaufsliste</CardTitle>
        <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Artikel
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {localItems.map((item) => {
            const member = getMember(item.addedBy);
            return (
              <li key={item.id} className="flex items-center gap-4 rounded-md border p-3 transition-colors hover:bg-secondary/50">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={item.purchased}
                  onCheckedChange={() => handleToggle(item.id)}
                  aria-label={`Mark item ${item.name} as ${item.purchased ? 'not purchased' : 'purchased'}`}
                />
                <div className="flex-1">
                  <label htmlFor={`item-${item.id}`} className={cn("font-medium", item.purchased && "text-muted-foreground line-through")}>
                    {item.name}
                  </label>
                </div>
                {member && (
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <span className='hidden sm:inline'>Hinzugefügt von</span>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
