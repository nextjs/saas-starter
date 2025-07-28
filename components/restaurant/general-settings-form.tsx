'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save } from 'lucide-react';
import { updatePublicConfiguration } from '@/app/(dashboard)/dashboard/restaurants/actions';
import type { RestaurantDetails } from '@/lib/types';
import {ActionState} from "@/lib/auth/middleware";

export function GeneralSettingsForm({ details }: { details: RestaurantDetails }) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        updatePublicConfiguration,
        {}
    );
    const config = details.publicConfigurations[0] || { branding: {}, restaurant: {}, features: {} };

    return (
        <form action={formAction}>
            <input type="hidden" name="restaurantId" value={details.id} />
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Branding</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <input type="hidden" name="branding.name" value={config.branding.name || details.name} />
                        <div className="grid gap-2">
                            <Label htmlFor="branding.logo">Logo URL</Label>
                            <Input id="branding.logo" name="branding.logo" defaultValue={config.branding.logo || ''} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="branding.accentColor">Accent Color</Label>
                            <Input type="color" id="branding.accentColor" name="branding.accentColor" defaultValue={config.branding.accentColor || '#000000'} />
                        </div>
                        <input type="hidden" name="branding.primaryColor" defaultValue={config.branding.primaryColor || '#000000'} />
                        <input type="hidden" name="branding.secondaryColor" defaultValue={config.branding.secondaryColor || '#000000'} />
                        <input type="hidden" name="branding.brainwavesColor" defaultValue={config.branding.brainwavesColor || '#000000'} />
                        <input type="hidden" name="branding.backgroundGradient" defaultValue={config.branding.backgroundGradient || ''} />
                        <input type="hidden" name="branding.brainwavesBackgroundColor" defaultValue={config.branding.brainwavesBackgroundColor || '#FFFFFF'} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Restaurant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <input type="hidden" name="restaurant.name" value={config.restaurant.name || details.name} />
                        <div className="grid gap-2">
                            <Label htmlFor="restaurant.phone">Phone</Label>
                            <Input id="restaurant.phone" name="restaurant.phone" defaultValue={config.restaurant.phone || ''} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="restaurant.address">Address</Label>
                            <Input id="restaurant.address" name="restaurant.address" defaultValue={config.restaurant.address || ''} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="restaurant.cuisine">Cuisine</Label>
                            <Input id="restaurant.cuisine" name="restaurant.cuisine" defaultValue={config.restaurant.cuisine || ''} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="restaurant.openingTime">Opening Time</Label>
                            <Input type="time" id="restaurant.openingTime" name="restaurant.openingTime" defaultValue={config.restaurant.openingTime || '09:00'} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="restaurant.closingTime">Closing Time</Label>
                            <Input type="time" id="restaurant.closingTime" name="restaurant.closingTime" defaultValue={config.restaurant.closingTime || '22:00'} />
                        </div>
                        <input type="hidden" name="restaurant.currencyCode" defaultValue={config.restaurant.currencyCode || 'USD'} />
                        <input type="hidden" name="restaurant.currencySymbol" defaultValue={config.restaurant.currencySymbol || '$'} />
                        <input type="hidden" name="restaurant.bookingTimeSlotInterval" defaultValue={config.restaurant.bookingTimeSlotInterval || 60} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(config.features || {analytics: true, multilingual: true, reservations: true, voiceOrdering: true, menuRecommendations: true}).map(key => (
                            <div key={key} className="flex items-center space-x-2">
                                <Checkbox id={`features.${key}`} name={`features.${key}`} defaultChecked={config.features[key] || false} value="true" />
                                <Label htmlFor={`features.${key}`} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                    {state?.error && <p className="text-sm text-red-500 self-center">{state.error}</p>}
                    {state?.success && <p className="text-sm text-green-500 self-center">{state.success}</p>}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save All Changes
                    </Button>
                </div>
            </div>
        </form>
    );
}