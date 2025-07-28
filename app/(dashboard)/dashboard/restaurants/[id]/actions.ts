'use server';

import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/drizzle';
import {
    NewRestaraunt,
    NewTeamRestaraunt,
    ActivityType,
    NewAgentPrompt,
    agentTypeEnum,
    NewPublicConfiguration,
    NewMenu
} from '@/lib/db/schema';
import {
    restaraunts,
    agentPrompts,
    publicConfigurations,
    menus
} from '@/lib/db/external';
import { teamRestaraunts } from '@/lib/db/schema';
import {
    getUserWithTeam,
    logActivity,
    verifyUserRestaurantAccess
} from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

// --- Zod Schemas for JSONB validation ---

// Simplified multi-language schema for KISS
const langSchema = z.record(z.string(), z.string());

const brandingSchema = z.object({
    logo: z.string().url().or(z.literal('')),
    name: z.string(),
    accentColor: z.string(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    brainwavesColor: z.string(),
    backgroundGradient: z.string(),
    brainwavesBackgroundColor: z.string()
});

const restaurantInfoSchema = z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    cuisine: z.string(),
    closingTime: z.string(),
    openingTime: z.string(),
    currencyCode: z.string(),
    currencySymbol: z.string(),
    bookingTimeSlotInterval: z.coerce.number()
});

const featuresSchema = z.object({
    analytics: z.boolean(),
    multilingual: z.boolean(),
    reservations: z.boolean(),
    voiceOrdering: z.boolean(),
    menuRecommendations: z.boolean()
});

const menuItemSchema = z.object({
    id: z.string(),
    name: langSchema,
    description: langSchema,
    price: z.coerce.number(),
    category: z.string(),
    image_url: z.string().optional(),
    available: z.boolean().default(true)
});

const menuCategorySchema = z.object({
    id: z.string(),
    name: langSchema,
    description: langSchema
});

const menuSchema = z.object({
    categories: z.record(z.string(), menuCategorySchema),
    items: z.array(menuItemSchema)
});

// --- Restaurant Actions ---
const createRestarauntSchema = z.object({
    name: z.string().min(1, 'Restaurant name is required').max(100)
});

export const createRestaraunt = validatedActionWithUser(
    createRestarauntSchema,
    async (data, _, user) => {
        const userWithTeam = await getUserWithTeam(user.id);
        if (!userWithTeam?.teamId) {
            return { error: 'You must be part of a team to create a restaurant.' };
        }
        const newRestaraunt: NewRestaraunt = {
            name: data.name,
            domain: uuidv4()
        };
        const [createdRestaraunt] = await db
            .insert(restaraunts)
            .values(newRestaraunt)
            .returning();
        if (!createdRestaraunt) return { error: 'Failed to create restaurant.' };

        await db
            .insert(teamRestaraunts)
            .values({
                teamId: userWithTeam.teamId,
                restarauntId: createdRestaraunt.id
            });
        await logActivity(
            userWithTeam.teamId,
            user.id,
            ActivityType.CREATE_RESTAURANT
        );
        return {
            success: 'Restaurant created successfully.',
            data: createdRestaraunt
        };
    }
);

// --- Public Configuration Actions ---

const updatePublicConfigurationSchema = z.object({
    restaurantId: z.string().uuid(),
    branding: brandingSchema,
    restaurant: restaurantInfoSchema,
    features: featuresSchema
});

export const updatePublicConfiguration = validatedActionWithUser(
    updatePublicConfigurationSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(
            user.id,
            data.restaurantId
        );
        if (!hasAccess)
            return { error: "You don't have permission to modify this restaurant." };

        const newConfig: NewPublicConfiguration = {
            restaurantId: data.restaurantId,
            branding: data.branding,
            restaurant: data.restaurant,
            features: data.features
        };
        const existing = await db.query.publicConfigurations.findFirst({
            where: eq(publicConfigurations.restaurantId, data.restaurantId)
        });

        if (existing) {
            await db
                .update(publicConfigurations)
                .set(newConfig)
                .where(eq(publicConfigurations.id, existing.id));
        } else {
            await db.insert(publicConfigurations).values(newConfig);
        }
        revalidatePath(`/dashboard/restaurants/${data.restaurantId}`);
        return { success: 'Public configuration updated successfully.' };
    }
);

// --- Agent Prompt Actions ---
const ensureDefaultPromptsSchema = z.object({
    restaurantId: z.string().uuid(),
    restaurantName: z.string()
});

export const ensureDefaultAgentPrompts = validatedActionWithUser(
    ensureDefaultPromptsSchema,
    async ({ restaurantId, restaurantName }, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(user.id, restaurantId);
        if (!hasAccess) return { error: 'Permission denied.' };

        const defaultPrompts: { name: 'booking' | 'order' | 'closing' | 'greeter'; template: (name: string) => string }[] = [
            { name: 'booking', template: (name) => `This is the booking agent for ${name}. Please assist the customer with their reservation.` },
            { name: 'order', template: (name) => `This is the order agent for ${name}. Help the customer place their order from the menu.` },
            { name: 'closing', template: (name) => `This is the closing agent for ${name}. Inform the user about closing times and last orders.` },
            { name: 'greeter', template: (name) => `This is the greeter for ${name}. Welcome the customer and ask how you can help them today.` },
        ];

        const existingPrompts = await db.query.agentPrompts.findMany({
            where: eq(agentPrompts.restaurantId, restaurantId)
        });
        const existingPromptNames = new Set(existingPrompts.map(p => p.agentName));

        const promptsToCreate: NewAgentPrompt[] = defaultPrompts
            .filter(p => !existingPromptNames.has(p.name))
            .map(p => ({
                restaurantId: restaurantId,
                agentName: p.name,
                promptText: p.template(restaurantName)
            }));

        if (promptsToCreate.length > 0) {
            await db.insert(agentPrompts).values(promptsToCreate);
        }
        revalidatePath(`/dashboard/restaurants/${restaurantId}`);
        return { success: 'Default prompts ensured successfully.' };
    }
);


const updateAgentPromptSchema = z.object({
    promptId: z.string().uuid(),
    promptText: z.string().min(1, 'Prompt text cannot be empty.')
});

export const updateAgentPrompt = validatedActionWithUser(
    updateAgentPromptSchema,
    async (data, _, user) => {
        const prompt = await db.query.agentPrompts.findFirst({where: eq(agentPrompts.id, data.promptId)});
        if (!prompt) return { error: 'Prompt not found.' };

        const hasAccess = await verifyUserRestaurantAccess(user.id, prompt.restaurantId);
        if (!hasAccess) return { error: 'Permission denied.' };

        await db.update(agentPrompts).set({ promptText: data.promptText }).where(eq(agentPrompts.id, data.promptId));
        revalidatePath(`/dashboard/restaurants/${prompt.restaurantId}`);
        return { success: 'Agent prompt updated successfully.' };
    }
);


// --- Menu Actions ---
const updateMenuSchema = z.object({
    restaurantId: z.string().uuid(),
    menuData: menuSchema
});

export const updateMenu = validatedActionWithUser(
    updateMenuSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(user.id, data.restaurantId);
        if (!hasAccess) return { error: "You don't have permission to modify this restaurant's menu." };

        const newMenu: NewMenu = {
            restaurantId: data.restaurantId,
            menuData: data.menuData
        };
        const existing = await db.query.menus.findFirst({
            where: eq(menus.restaurantId, data.restaurantId)
        });

        if (existing) {
            await db
                .update(menus)
                .set({ menuData: data.menuData })
                .where(eq(menus.id, existing.id));
        } else {
            await db.insert(menus).values(newMenu);
        }
        revalidatePath(`/dashboard/restaurants/${data.restaurantId}`);
        return { success: 'Menu updated successfully.' };
    }
);