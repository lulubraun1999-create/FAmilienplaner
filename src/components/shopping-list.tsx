'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { ShoppingListItem, FamilyMember } from '@/lib/types';
import { cn, getInitials } from '@/lib/utils';
import { Button } from './ui/button';
import { Plus, Trash2, Hand, User as UserIcon, Users } from 'lucide-react';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface ShoppingListProps {
  items: ShoppingListItem[];
  members: FamilyMember[];
  onAddItem: (itemName: string, assignedTo?: string) => void;
  onUpdateItem: (itemId: string, data: Partial<ShoppingListItem>) => void;
  onDeleteItem: (itemId: string) => void;
  currentUserId: string;
}

export default function ShoppingList({ items, members, onAddItem, onUpdateItem, onDeleteItem, currentUserId }: ShoppingListProps) {
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddNewItem = (assignedTo?: string) => {
    if (newItemName.trim()) {
      onAddItem(newItemName.trim(), assignedTo);
      setNewItemName('');
      setIsAdding(false);
    }
  };

  const getMember = (memberId: string | undefined) => members.find(m => m.id === memberId);

  const { familyItems, myItems } = useMemo(() => {
    const familyItems = items.filter(item => !item.assignedTo && !item.purchased);
    const myItems = items.filter(item => item.assignedTo === currentUserId && !item.purchased);
    return { familyItems, myItems };
  }, [items, currentUserId]);
  
  const purchasedItems = useMemo(() => {
      return items.filter(item => item.purchased).sort((a,b) => (getMember(a.assignedTo || '')?.name || '').localeCompare(getMember(b.assignedTo || '')?.name || ''));
  }, [items]);

  const handleTakeItem = (itemId: string) => {
    onUpdateItem(itemId, { assignedTo: currentUserId });
  };
  
  const handleUntakeItem = (itemId: string) => {
    onUpdateItem(itemId, { assignedTo: '' });
  };
  
  const handleTogglePurchased = (itemId: string, purchased: boolean) => {
      onUpdateItem(itemId, { purchased, assignedTo: purchased ? (items.find(i => i.id === itemId)?.assignedTo || currentUserId) : items.find(i => i.id === itemId)?.assignedTo });
  }

  const ShoppingListItemRow = ({ item, showAssignee = false }: { item: ShoppingListItem; showAssignee?: boolean }) => {
    const member = getMember(item.addedBy);
    const assignedMember = item.assignedTo ? getMember(item.assignedTo) : null;
    return (
       <li key={item.id} className="flex items-center gap-4 rounded-md p-2 transition-colors hover:bg-secondary/50">
            <Checkbox
              id={`item-${item.id}`}
              checked={item.purchased}
              onCheckedChange={(checked) => handleTogglePurchased(item.id, Boolean(checked))}
              aria-label={`Mark item ${item.name} as ${item.purchased ? 'not purchased' : 'purchased'}`}
            />
            <div className="flex-1">
              <label htmlFor={`item-${item.id}`} className={cn("font-medium", item.purchased && "text-muted-foreground line-through")}>
                {item.name}
              </label>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>Hinzugefügt von:</span>
                {member && (
                    <Avatar className="h-4 w-4">
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                )}
              </div>
            </div>
            <div className='flex items-center gap-2'>
               {showAssignee && assignedMember && (
                 <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <span className='hidden sm:inline'>Gekauft von</span>
                     <Avatar className="h-6 w-6">
                        <AvatarFallback>{getInitials(assignedMember.name)}</AvatarFallback>
                    </Avatar>
                 </div>
               )}
                
                {!item.purchased && !item.assignedTo && (
                    <Button variant="outline" size="sm" onClick={() => handleTakeItem(item.id)}>
                        <Hand className="mr-2 h-4 w-4"/> Übernehmen
                    </Button>
                )}
                {!item.purchased && item.assignedTo === currentUserId && (
                    <Button variant="outline" size="sm" onClick={() => handleUntakeItem(item.id)}>
                        Zurücklegen
                    </Button>
                )}

                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </li>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Einkaufsliste</CardTitle>
            <CardDescription>Verwalte die Einkäufe für die ganze Familie.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Artikel
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="flex flex-col gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
             <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Was wird benötigt?"
              onKeyDown={(e) => e.key === 'Enter' && handleAddNewItem()}
              autoFocus
            />
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                    <Button onClick={() => handleAddNewItem()} size="sm">
                        <Users className="mr-2 h-4 w-4" />
                        Für alle hinzufügen
                    </Button>
                     <Button onClick={() => handleAddNewItem(currentUserId)} variant="secondary" size="sm">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Für mich
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm">
                                Für jemand anderen...
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {members.filter(m => m.id !== currentUserId).map(member => (
                                <DropdownMenuItem key={member.id} onClick={() => handleAddNewItem(member.id)}>
                                     <Avatar className="h-6 w-6 mr-2">
                                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                    </Avatar>
                                    <span>{member.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Button variant="ghost" onClick={() => setIsAdding(false)}>Abbrechen</Button>
            </div>
          </div>
        )}
        
        <div className='space-y-6'>
            <div>
                <h3 className='font-semibold mb-2'>Mein Anteil</h3>
                {myItems.length > 0 ? (
                    <ul className="space-y-2 rounded-md border p-2">
                        {myItems.map(item => <ShoppingListItemRow key={item.id} item={item} />)}
                    </ul>
                ) : (
                    <p className='text-sm text-muted-foreground text-center p-4 border rounded-md'>Du hast keine Artikel übernommen.</p>
                )}
            </div>
            
            <Separator />

            <div>
                <h3 className='font-semibold mb-2'>Für die Familie</h3>
                {familyItems.length > 0 ? (
                     <ul className="space-y-2 rounded-md border p-2">
                        {familyItems.map(item => <ShoppingListItemRow key={item.id} item={item} />)}
                    </ul>
                ) : (
                    <p className='text-sm text-muted-foreground text-center p-4 border rounded-md'>Aktuell gibt es nichts für die Familie einzukaufen.</p>
                )}
            </div>

            {purchasedItems.length > 0 && (
                 <>
                    <Separator />
                    <div>
                        <h3 className='font-semibold mb-2'>Bereits gekaufte Artikel</h3>
                         <ul className="space-y-2 rounded-md border p-2 bg-muted/50">
                            {purchasedItems.map(item => <ShoppingListItemRow key={item.id} item={item} showAssignee={true} />)}
                        </ul>
                    </div>
                 </>
            )}
        </div>


        {items.length === 0 && !isAdding && (
            <p className="text-center text-sm text-muted-foreground py-8">Die Einkaufsliste ist leer.</p>
        )}
      </CardContent>
    </Card>
  );
}
    