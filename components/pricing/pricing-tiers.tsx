'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Minus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel"

// NOTE: The `checkoutAction` import is no longer needed here.

export function PricingTiers({ products, prices }: { products: any[]; prices: any[] }) {
    const [billingCycle, setBillingCycle] = useState('month');
    const [selectedProAgent, setSelectedProAgent] = useState('Pro - Drive Thru');
    const [deviceCounts, setDeviceCounts] = useState({ standard: 0, pro: 0, allinclusive: 0 });

    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }
        // Set initial slide to the "Pro" plan
        api.scrollTo(1, true);
        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    const agents = {
        restaurant: { name: "Restaurant Agent", emoji: "🤵🏻" },
        manager: { name: "Manager Agent", emoji: "⚙️" },
        smallTalker: { name: "Small Talk Agent", emoji: "💬" },
        api: { name: "API Agent", emoji: "⚡" },
        driveThru: { name: "Drive Thru Agent", emoji: "🚗", description: "+$269/mo (after discount)" },
        hospitality: { name: "Booking Agent", emoji: "📅", description: "+$179/mo (after discount)" },
    };

    const updateDeviceCount = (plan: string, increment: number) => {
        setDeviceCounts(prev => ({ ...prev, [plan]: Math.max(0, prev[plan] + increment) }));
    };

    const getPriceForPlan = (productName: string, cycle: 'month' | 'year') => {
        const product = products.find(p => p.name === productName);
        if (!product) return null;
        return prices.find(price => price.productId == product.id && price.interval === cycle);
    };

    const packages = [
        { name: 'Standard', popular: false, key: 'standard', color: 'border-gray-300', baseAgents: ['restaurant', 'manager', 'smallTalker', 'api'] },
        { name: 'Pro', popular: true, key: 'pro', color: 'border-yellow-400', baseAgents: ['restaurant', 'manager', 'smallTalker', 'api'] },
        { name: 'All Inclusive', popular: false, key: 'allinclusive', color: 'border-purple-500', baseAgents: ['restaurant', 'manager', 'smallTalker', 'api', 'driveThru', 'hospitality'], badge: 'Best Value' }
    ];

    const PricingCard = ({ pkg }: { pkg: typeof packages[0] }) => {
        let currentPrice;
        let productName = pkg.name;
        if (pkg.name === 'Pro') productName = selectedProAgent;
        else if (pkg.name === 'All Inclusive') productName = 'All Inclusive';
        currentPrice = getPriceForPlan(productName, billingCycle as 'month' | 'year');
        const deviceCount = deviceCounts[pkg.key as keyof typeof deviceCounts];
        const devicePrice = billingCycle === 'month' ? 99 : Math.round(99 * 12 / 12);
        const planPriceAmount = currentPrice ? currentPrice.unitAmount / 100 : 0;
        const totalPrice = planPriceAmount + (deviceCount * devicePrice);

        return (
            <div className={`relative flex flex-col bg-white rounded-3xl p-8 border ${pkg.color} ${pkg.popular ? 'shadow-2xl' : 'shadow-lg'}`}>
                {pkg.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-full text-sm font-bold">Most Popular</div>}
                {pkg.badge && !pkg.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-bold">{pkg.badge}</div>}

                <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <div className="bg-gray-100 rounded-lg p-4 mb-6 h-[72px] flex items-center">
                        {currentPrice ?
                            <><span className="text-4xl font-bold text-gray-900">${planPriceAmount}</span><span className="text-gray-600 text-sm ml-1">/{billingCycle === 'month' ? 'mo' : 'yr'}</span></>
                            : <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                        }
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Included Agents:</h4>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {pkg.baseAgents.map(key =>
                            <div key={key} className="flex items-center p-2 bg-gray-100 rounded-lg">
                                <span className="text-lg mr-2">{agents[key as keyof typeof agents].emoji}</span>
                                <span className="text-xs font-medium text-gray-700 truncate">{agents[key as keyof typeof agents].name}</span>
                            </div>
                        )}
                    </div>
                    {pkg.name === 'Pro' && (
                        <div className="mb-6"><h4 className="text-sm font-semibold text-gray-900 mb-3">Choose one specialized agent:</h4><div className="space-y-2">
                            <button onClick={() => setSelectedProAgent('Pro - Drive Thru')} className={`w-full flex items-center p-3 rounded-lg border-2 ${selectedProAgent === 'Pro - Drive Thru' ? 'border-blue-500 bg-blue-50' : 'bg-white border-gray-200'}`}><span className="text-lg mr-3">{agents.driveThru.emoji}</span><div className="text-left"><div className="text-sm font-medium">{agents.driveThru.name}</div><div className="text-xs text-gray-600">{agents.driveThru.description}</div></div></button>
                            <button onClick={() => setSelectedProAgent('Pro - Hospitality')} className={`w-full flex items-center p-3 rounded-lg border-2 ${selectedProAgent === 'Pro - Hospitality' ? 'border-blue-500 bg-blue-50' : 'bg-white border-gray-200'}`}><span className="text-lg mr-3">{agents.hospitality.emoji}</span><div className="text-left"><div className="text-sm font-medium">{agents.hospitality.name}</div><div className="text-xs text-gray-600">{agents.hospitality.description}</div></div></button>
                        </div></div>
                    )}
                </div>

                <div className="mt-auto">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center"><span className="text-sm font-semibold">Devices</span><HelpCircle className="h-4 w-4 text-gray-400 ml-2" /></div>
                            <div className="flex items-center"><button onClick={() => updateDeviceCount(pkg.key, -1)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center" disabled={deviceCount <= 0}><Minus className="h-4 w-4" /></button><span className="mx-3 font-semibold">{deviceCount}</span><button onClick={() => updateDeviceCount(pkg.key, 1)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"><Plus className="h-4 w-4" /></button></div>
                        </div>
                        <div className="text-xs text-gray-600 mb-2 h-4">{deviceCount > 0 ? `$${devicePrice}/mo per device` : 'No devices selected'}</div>
                        <div className="text-sm font-semibold">Total: ${currentPrice ? totalPrice.toFixed(0) : '...'}/{billingCycle === 'month' ? 'mo' : 'yr'}</div>
                    </div>
                    <form action="/api/checkout" method="POST" target="_top">
                        <input type="hidden" name="priceId" value={currentPrice?.id} />
                        <input type="hidden" name="deviceCount" value={deviceCount} />
                        <input type="hidden" name="interval" value={billingCycle} />
                        <Button type="submit" variant="outline" className="w-full rounded-full" disabled={!currentPrice}>
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
                    <button onClick={() => setBillingCycle('month')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'month' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>Monthly</button>
                    <button onClick={() => setBillingCycle('year')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'year' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}>Annual <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Save 10%</span></button>
                </div>
            </div>

            {/* Desktop: Grid View */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-8 items-start">
                {packages.map((pkg) => (
                    <PricingCard key={pkg.key} pkg={pkg} />
                ))}
            </div>

            {/* Mobile: Carousel View */}
            <div className="lg:hidden">
                <Carousel setApi={setApi} opts={{ align: "start" }}>
                    <CarouselContent>
                        {packages.map((pkg, index) => (
                            <CarouselItem key={index} className="pt-6">
                                <PricingCard pkg={pkg} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                {/* Dots Navigation */}
                <div className="flex justify-center items-center mt-8 space-x-3">
                    {packages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={cn(
                                'h-2.5 w-2.5 rounded-full transition-all duration-300 ease-in-out',
                                current === index ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400'
                            )}
                            aria-label={`Show ${packages[index].name} plan`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}