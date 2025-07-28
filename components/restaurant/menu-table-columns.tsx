//<file path="components/restaurant/menu-table-columns.tsx">
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { MenuItem } from '@/lib/types';

type GetColumnsProps = {
    onEdit: (item: MenuItem) => void;
    onDelete: (itemId: string) => void;
};

export const getColumns = ({
                               onEdit,
                               onDelete
                           }: GetColumnsProps): ColumnDef<MenuItem>[] => [
    {
        accessorKey: 'image_url',
        header: 'Image',
        cell: ({ row }) => {
            const name = row.original.name["en-US"] || 'M';
            return (
                <Avatar>
                    <AvatarImage src={row.original.image_url} alt={name} />
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            );
        }
    },
    {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
            // We are displaying only 'en' for simplicity as requested
            return <div className="font-medium">{row.original.name['en-US']}</div>;
        }
    },
    {
        accessorKey: 'price',
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);

            return <div className="text-right font-medium">{formatted}</div>;
        }
    },
    {
        accessorKey: 'available',
        header: 'Status',
        cell: ({ row }) => {
            const isAvailable = row.getValue('available');
            return (
                <Badge variant={isAvailable ? 'default' : 'destructive'}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const item = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                            Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(item.id)}
                        >
                            Delete Item
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];