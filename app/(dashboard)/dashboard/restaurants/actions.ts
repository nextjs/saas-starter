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
    NewMenu,
} from '@/lib/db/schema';
import {
    restaraunts,
    agentPrompts,
    publicConfigurations,
    menus
} from '@/lib/db/external';
import { teamRestaraunts } from '@/lib/db/schema';
import {
    getUser,
    getUserWithTeam,
    logActivity,
    verifyUserRestaurantAccess
} from '@/lib/db/queries';
import {ActionState, validatedActionWithUser} from '@/lib/auth/middleware';
import { revalidatePath } from 'next/cache';

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

// --- Zod Schemas for JSONB validation ---
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

const menuSchema = z.object({
    categories: z.record(z.string(), z.any()), // Simplified for now
    items: z.array(menuItemSchema)
});

const updatePublicConfigurationSchema = z.object({
    restaurantId: z.string().uuid(),
    branding: brandingSchema,
    restaurant: restaurantInfoSchema,
    features: featuresSchema
});


// --- Restaurant Actions (Unchanged) ---
const createRestarauntSchema = z.object({
    name: z.string().min(1, 'Restaurant name is required').max(100)
});


// Initialize the Google AI client
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
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


// --- Public Configuration Action (Corrected to handle form data) ---
export async function updatePublicConfiguration(
    prevState: ActionState, formData: FormData
): Promise<ActionState> {
    const user = await getUser();
    if (!user) throw new Error("User is not authenticated");

    // Custom FormData to nested object parser
    const rawData: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
        const keys = key.split('.');
        let current = rawData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]] = current[keys[i]] || {};
        }
        current[keys[keys.length - 1]] = value;
    }

    // Handle unchecked checkboxes
    const featureKeys = ['analytics', 'multilingual', 'reservations', 'voiceOrdering', 'menuRecommendations'];
    rawData.features = rawData.features || {};
    for (const key of featureKeys) {
        rawData.features[key] = rawData.features[key] === 'true'; // "true" becomes true, undefined becomes false
    }

    const result = updatePublicConfigurationSchema.safeParse(rawData);
    if (!result.success) {
        console.error("Zod validation failed:", result.error.flatten());
        return { error: result.error.message };
    }

    const data = result.data;
    const hasAccess = await verifyUserRestaurantAccess(user.id, data.restaurantId);
    if (!hasAccess) return { error: "You don't have permission to modify this restaurant." };

    const newConfig = {
        restaurantId: data.restaurantId,
        branding: data.branding,
        restaurant: data.restaurant,
        features: data.features,
    };

    const existing = await db.query.publicConfigurations.findFirst({
        where: eq(publicConfigurations.restaurantId, data.restaurantId)
    });

    if (existing) {
        await db.update(publicConfigurations).set(newConfig).where(eq(publicConfigurations.id, existing.id));
    } else {
        await db.insert(publicConfigurations).values(newConfig);
    }

    revalidatePath(`/dashboard/restaurants/${data.restaurantId}`);
    return { success: 'Public configuration updated successfully.' };
}

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

// --- Menu Actions (Unchanged) ---
const updateMenuSchema = z.object({
    restaurantId: z.string().uuid(),
    menuData: menuSchema
});

export const updateMenu = validatedActionWithUser(
    updateMenuSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(user.id, data.restaurantId);
        if (!hasAccess) return { error: "You don't have permission to modify this restaurant's menu." };
        const newMenu: NewMenu = { restaurantId: data.restaurantId, menuData: data.menuData };
        const existing = await db.query.menus.findFirst({ where: eq(menus.restaurantId, data.restaurantId) });
        if (existing) {
            await db.update(menus).set({ menuData: data.menuData }).where(eq(menus.id, existing.id));
        } else {
            await db.insert(menus).values(newMenu);
        }
        revalidatePath(`/dashboard/restaurants/${data.restaurantId}`);
        return { success: 'Menu updated successfully.' };
    }
);

const ensureDefaultPromptsSchema = z.object({
    restaurantId: z.string().uuid(),
    restaurantName: z.string()
});

export const ensureDefaultAgentPrompts = validatedActionWithUser(
    ensureDefaultPromptsSchema,
    async ({ restaurantId, restaurantName }, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(user.id, restaurantId);
        if (!hasAccess) return { error: 'Permission denied.' };

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return { error: 'Google AI API key is not configured on the server.' };
        }

        const agentTypes: ('booking' | 'order' | 'closing' | 'greeter')[] = [
            'booking', 'order', 'closing', 'greeter'
        ];

        const existingPrompts = await db.query.agentPrompts.findMany({
            where: eq(agentPrompts.restaurantId, restaurantId)
        });
        const existingPromptNames = new Set(existingPrompts.map(p => p.agentName));

        const promptsToGenerate = agentTypes.filter(type => !existingPromptNames.has(type));

        if (promptsToGenerate.length === 0) {
            return { success: 'All agent prompts already exist.' };
        }

        try {
            const newPromptsPromises = promptsToGenerate.map(async (agentType) => {
                const systemPrompt = `You are an expert prompt engineer creating instructions for a customer service AI. Your task is to generate a clear, concise, and effective system prompt for an AI agent that will interact with customers of a restaurant.`;
                const userPrompt = `Generate a system prompt for an AI agent at a restaurant named "${restaurantName}". The agent's specific role is: "${agentType}". The tone should be friendly, efficient, and helpful. The output must be only the prompt text itself, without any introductory phrases like "Here is the prompt:".`;

                const { text } = await generateText({
                    model: google('models/gemini-2.5-pro'),
                    system: systemPrompt,
                    prompt: userPrompt,
                });

                return {
                    restaurantId,
                    agentName: agentType,
                    promptText: text,
                };
            });

            const newPrompts = await Promise.all(newPromptsPromises);

            if (newPrompts.length > 0) {
                await db.insert(agentPrompts).values(newPrompts as NewAgentPrompt[]);
            }

            revalidatePath(`/dashboard/restaurants/${restaurantId}`);
            return { success: 'AI-generated prompts created successfully.' };

        } catch (error) {
            console.error("AI prompt generation failed:", error);
            return { error: 'Failed to generate prompts with AI. Please check your API key and try again.' };
        }
    }
);