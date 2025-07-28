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
            domain: uuidv4() // Generate a unique domain
        };

        const [createdRestaraunt] = await db
            .insert(restaraunts)
            .values(newRestaraunt)
            .returning();

        if (!createdRestaraunt) {
            return { error: 'Failed to create restaurant.' };
        }

        const newTeamRestarauntLink: NewTeamRestaraunt = {
            teamId: userWithTeam.teamId,
            restarauntId: createdRestaraunt.id
        };

        await db.insert(teamRestaraunts).values(newTeamRestarauntLink);

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

const updateRestarauntSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Restaurant name is required').max(100).optional(),
    properties: z.any().optional() // Or a more specific zod schema for properties
});

export const updateRestaraunt = validatedActionWithUser(
    updateRestarauntSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(user.id, data.id);
        if (!hasAccess) {
            return { error: "You don't have permission to modify this restaurant." };
        }

        await db
            .update(restaraunts)
            .set({
                name: data.name,
                properties: data.properties,
                updatedAt: new Date()
            })
            .where(eq(restaraunts.id, data.id));

        return { success: 'Restaurant updated successfully.' };
    }
);

const deleteRestarauntSchema = z.object({
    id: z.string().uuid()
});

export const deleteRestaraunt = validatedActionWithUser(
    deleteRestarauntSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(user.id, data.id);
        if (!hasAccess) {
            return { error: "You don't have permission to delete this restaurant." };
        }

        await db.delete(restaraunts).where(eq(restaraunts.id, data.id));

        return { success: 'Restaurant deleted successfully.' };
    }
);

// --- Agent Prompt Actions ---

const updateAgentPromptSchema = z.object({
    restaurantId: z.string().uuid(),
    agentName: z.enum(agentTypeEnum.enumValues),
    promptText: z.string().min(1, 'Prompt text cannot be empty.')
});

export const updateAgentPrompt = validatedActionWithUser(
    updateAgentPromptSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(
            user.id,
            data.restaurantId
        );
        if (!hasAccess) {
            return { error: "You don't have permission to modify this restaurant." };
        }

        const newPrompt: NewAgentPrompt = {
            restaurantId: data.restaurantId,
            agentName: data.agentName,
            promptText: data.promptText
        };

        const existing = await db.query.agentPrompts.findFirst({
            where: and(
                eq(agentPrompts.restaurantId, data.restaurantId),
                eq(agentPrompts.agentName, data.agentName)
            )
        });

        if (existing) {
            await db
                .update(agentPrompts)
                .set({ promptText: data.promptText })
                .where(eq(agentPrompts.id, existing.id));
        } else {
            await db.insert(agentPrompts).values(newPrompt);
        }

        return { success: 'Agent prompt updated successfully.' };
    }
);

// --- Public Configuration Actions ---

const updatePublicConfigurationSchema = z.object({
    restaurantId: z.string().uuid(),
    branding: z.any(),
    restaurant: z.any(),
    features: z.any()
});

export const updatePublicConfiguration = validatedActionWithUser(
    updatePublicConfigurationSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(
            user.id,
            data.restaurantId
        );
        if (!hasAccess) {
            return { error: "You don't have permission to modify this restaurant." };
        }

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
                .set({
                    branding: data.branding,
                    restaurant: data.restaurant,
                    features: data.features
                })
                .where(eq(publicConfigurations.id, existing.id));
        } else {
            await db.insert(publicConfigurations).values(newConfig);
        }

        return { success: 'Public configuration updated successfully.' };
    }
);

// --- Menu Actions ---
const updateMenuSchema = z.object({
    restaurantId: z.string().uuid(),
    menuData: z.any()
});

export const updateMenu = validatedActionWithUser(
    updateMenuSchema,
    async (data, _, user) => {
        const hasAccess = await verifyUserRestaurantAccess(
            user.id,
            data.restaurantId
        );
        if (!hasAccess) {
            return {
                error: "You don't have permission to modify this restaurant's menu."
            };
        }

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

        return { success: 'Menu updated successfully.' };
    }
);