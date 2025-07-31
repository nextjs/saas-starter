'use client';

import { use } from 'react';
import useSWR from 'swr';
import { Card, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneralSettingsForm } from '@/components/restaurant/general-settings-form';
import { MenuEditor } from '@/components/restaurant/menu-editor';
import { AgentPromptsManager } from '@/components/restaurant/agent-prompts-manager';
import type { RestaurantDetails } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RestaurantConfigPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise);
    const {
        data: details,
        error,
        isLoading
    } = useSWR<RestaurantDetails>(
        `/api/team/restaurants/${params.id}`,
        fetcher
    );

    if (isLoading) {
        return (
            <section className="flex-1 p-4 lg:p-8">
                <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse mb-6"></div>
                <Card className="min-h-[400px]">
                    <CardHeader>
                        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse mt-2"></div>
                    </CardHeader>
                </Card>
            </section>
        );
    }

    if (error || !details) {
        return (
            <section className="flex-1 p-4 lg:p-8">
                <h1 className="text-lg lg:text-2xl font-medium text-red-600 mb-6">Error Loading Restaurant</h1>
                <p>Could not load restaurant data. It might not exist or you may not have permission to view it.</p>
            </section>
        );
    }

    return (
        <section className="flex-1 p-4 lg:p-8">
            <div className="mb-6">
                <h1 className="text-lg lg:text-2xl font-medium">Configure Restaurant</h1>
                <p className="text-muted-foreground">{details.name}</p>
            </div>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="general">General Settings ⚙️</TabsTrigger>
                    <TabsTrigger value="menu">Menu Editor 🍲</TabsTrigger>
                    <TabsTrigger value="prompts">Agent Prompts 🤖</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="mt-4">
                    <GeneralSettingsForm details={details} />
                </TabsContent>
                <TabsContent value="menu" className="mt-4">
                    <MenuEditor details={details} />
                </TabsContent>
                <TabsContent value="prompts" className="mt-4">
                    <AgentPromptsManager details={details} />
                </TabsContent>
            </Tabs>
        </section>
    );
}