'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, AlertCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useRef, Suspense } from 'react';
import useSWR, { mutate } from 'swr';
import { Restaraunt } from '@/lib/db/schema';
import { createRestaraunt } from './restaurants/[id]/actions';

type CreateActionState = {
  error?: string;
  success?: string;
  data?: Restaraunt;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CreateRestaurantForm() {
  const [state, formAction, isPending] = useActionState<
      CreateActionState,
      FormData
  >(createRestaraunt, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      mutate('/api/team/restaurants');
    }
  }, [state.success]);

  return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create a New Restaurant</CardTitle>
          <CardDescription>
            Add a new restaurant to your team to start configuring it.
          </CardDescription>
        </CardHeader>
        <form action={formAction} ref={formRef}>
          <CardContent>
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
                <p className="text-sm text-red-500 mt-2">{state.error}</p>
            )}
            {state.success && !state.error && (
                <p className="text-sm text-green-500 mt-2">{state.success}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
              ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Restaurant
                  </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
  );
}

function RestaurantsListSkeleton() {
  return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-2/5 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded mt-2"></div>
              </CardHeader>
              <CardFooter>
                <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
              </CardFooter>
            </Card>
        ))}
      </div>
  );
}

function RestaurantsList() {
  const {
    data: restaurants,
    error,
    isLoading
  } = useSWR<Restaraunt[]>('/api/team/restaurants', fetcher);

  if (isLoading) {
    return <RestaurantsListSkeleton />;
  }

  if (error) {
    return (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">
              Error Loading Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              We couldn't fetch your restaurants. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
    );
  }

  if (!restaurants || restaurants.length === 0) {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">
            No restaurants found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first restaurant above.
          </p>
        </div>
    );
  }

  return (
      <div className="space-y-4">
        {restaurants.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardHeader>
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription>Domain: {restaurant.domain}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/restaurants/${restaurant.id}`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Link>
                </Button>
              </CardFooter>
            </Card>
        ))}
      </div>
  );
}

export default function DashboardPage() {
  return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-lg lg:text-2xl font-medium mb-2 sm:mb-0">
            My Restaurants
          </h1>
        </div>

        <CreateRestaurantForm />

        <h2 className="text-lg font-medium text-gray-900 mb-4 mt-8">
          Existing Restaurants
        </h2>
        <Suspense fallback={<RestaurantsListSkeleton />}>
          <RestaurantsList />
        </Suspense>
      </section>
  );
}