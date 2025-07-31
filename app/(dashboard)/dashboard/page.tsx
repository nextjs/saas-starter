//<file path="app/(dashboard)/dashboard/page.tsx">
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Settings, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useRef, Suspense, useState } from 'react';
import useSWR, { mutate } from 'swr';
import type { Restaraunt } from '@/lib/db/schema';
import { createRestaraunt } from './restaurants/[id]/actions';

type CreateActionState = {
    error?: string;
    success?: string;
    data?: Restaraunt;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function AddRestaurantCard() {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState<
        CreateActionState,
        FormData
    >(createRestaraunt, {});
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            mutate('/api/team/restaurants');
            setOpen(false); // Close dialog on success
        }
    }, [state.success]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card className="flex flex-col items-center justify-center h-48 border-2 border-dashed hover:border-primary hover:bg-muted/50 transition-all cursor-pointer group !gap-2">
                    <Plus className="h-12 w-12 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-transform" />
                    <p className="font-medium text-muted-foreground group-hover:text-primary">
                        Add Restaurant
                    </p>
                </Card>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Restaurant</DialogTitle>
                    <DialogDescription>
                        Add a new restaurant to your team to start configuring it.
                    </DialogDescription>
                </DialogHeader>
                <form action={formAction} ref={formRef} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Restaurant Name</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="e.g., The Grand Bistro"
                            required
                        />
                    </div>
                    {state.error && (
                        <p className="text-sm text-red-500">{state.error}</p>
                    )}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Restaurant'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function RestaurantCard({ restaurant }: { restaurant: Restaraunt }) {
    return (
        <Card key={restaurant.id} className="flex flex-col h-48">
            <CardHeader className="flex-grow">
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription>Domain: {restaurant.domain}</CardDescription>
            </CardHeader>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/dashboard/restaurants/${restaurant.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function RestaurantsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse h-48">
                    <CardHeader className="flex-grow">
                        <div className="h-6 w-3/5 bg-muted rounded"></div>
                        <div className="h-4 w-4/5 bg-muted rounded mt-2"></div>
                    </CardHeader>
                    <CardFooter>
                        <div className="h-10 w-full bg-muted rounded-md"></div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

function RestaurantsGrid() {
    const {
        data: restaurants,
        error,
        isLoading
    } = useSWR<Restaraunt[]>('/api/team/restaurants', fetcher);

    if (isLoading) {
        return <RestaurantsGridSkeleton />;
    }

    if (error) {
        return (
            <Card className="bg-destructive/10 border-destructive/30">
                <CardHeader>
                    <CardTitle className="text-destructive">
                        Error Loading Restaurants
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive/80">
                        We couldn't fetch your restaurants. Please try refreshing the page.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {restaurants?.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
            <AddRestaurantCard />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <section className="flex-1 p-4 lg:p-8">
            <div className="mb-6">
                <h1 className="text-lg lg:text-2xl font-medium">My Restaurants</h1>
                <p className="text-muted-foreground">
                    Manage your restaurants or add a new one.
                </p>
            </div>
            <Suspense fallback={<RestaurantsGridSkeleton />}>
                <RestaurantsGrid />
            </Suspense>
        </section>
    );
}