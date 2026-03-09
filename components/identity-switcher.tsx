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
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-sm hover:bg-[#ebe5d9] outline-none cursor-pointer transition-colors border-2 border-dashed border-transparent hover:border-[#d4c9b8]">
        <Avatar className="h-6 w-6 border border-dashed border-[#d4c9b8]">
          <AvatarImage src={active.avatar} alt={active.name} />
          <AvatarFallback className="text-[10px] bg-[#ebe5d9] text-[#5c4b3a]">
            {active.name
              .split(' ')
              .map((w) => w[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 truncate">
          <span className="font-medium text-[#5c4b3a]">{active.name}</span>
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#5c4b3a]/40" strokeWidth={1.75} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px] rounded-xl border-2 border-dashed border-[#d4c9b8] bg-[#faf8f5]">
        {mockIdentities.map((identity) => (
          <DropdownMenuItem
            key={identity.id}
            className="cursor-pointer rounded-lg text-[#5c4b3a] focus:bg-[#ebe5d9]"
            onClick={() => setActiveId(identity.id)}
          >
            <Avatar className="mr-2 h-5 w-5 border border-dashed border-[#d4c9b8]">
              <AvatarImage src={identity.avatar} alt={identity.name} />
              <AvatarFallback className="text-[9px] bg-[#ebe5d9] text-[#5c4b3a]">
                {identity.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{identity.name}</span>
            {identity.id === activeId && (
              <Check className="ml-auto h-4 w-4 text-[#7c9a6e]" strokeWidth={1.75} />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-[#d4c9b8]/50" />
        <DropdownMenuItem className="cursor-pointer rounded-lg text-[#5c4b3a]/60 focus:bg-[#ebe5d9]">
          <Plus className="mr-2 h-4 w-4" strokeWidth={1.75} />
          Add Identity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
