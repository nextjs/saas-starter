'use client';

import useSWR from 'swr';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, LogOut } from 'lucide-react';

import { User } from '@/lib/db/schema';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/(login)/actions';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const UserMenu = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: user } = useSWR<User>('/api/user', fetcher);
    const router = useRouter();

    async function handleSignOut() {
        await signOut();
        router.refresh();
        router.push('/');
    }

    if (!user) {
        return (
            <>
                <Link
                    href="/pricing"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                    Pricing
                </Link>
                <Button asChild className="rounded-full">
                    <Link href="/sign-up">Sign Up</Link>
                </Button>
            </>
        );
    }

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger>
                <Avatar className="cursor-pointer size-9">
                    <AvatarImage alt={user.name || ''} />
                    <AvatarFallback>
                        {user.email
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="flex flex-col gap-1">
                <DropdownMenuItem className="cursor-pointer">
                    <Link href="/dashboard" className="flex w-full items-center">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                    </Link>
                </DropdownMenuItem>
                <form action={handleSignOut} className="w-full">
                    <button type="submit" className="flex w-full">
                        <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </button>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default UserMenu
