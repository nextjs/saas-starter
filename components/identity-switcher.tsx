'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Identity {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
}

const mockIdentities: Identity[] = [
  { id: '1', name: 'Personal Brand', handle: '@you' },
  { id: '2', name: 'Acme Inc', handle: '@acmeinc' },
];

export function IdentitySwitcher() {
  const [activeId, setActiveId] = useState(mockIdentities[0].id);
  const active = mockIdentities.find((i) => i.id === activeId) ?? mockIdentities[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent outline-none cursor-pointer transition-colors">
        <Avatar className="h-6 w-6">
          <AvatarImage src={active.avatar} alt={active.name} />
          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
            {active.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 truncate">
          <span className="font-medium">{active.name}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        {mockIdentities.map((identity) => (
          <DropdownMenuItem
            key={identity.id}
            className="cursor-pointer"
            onClick={() => setActiveId(identity.id)}
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage src={identity.avatar} alt={identity.name} />
              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                {identity.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{identity.name}</span>
            {identity.id === activeId && (
              <Check className="ml-auto h-4 w-4 text-primary" strokeWidth={1.75} />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-muted-foreground">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Add Identity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
