import {jsonb, pgEnum, pgSchema, pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");
export const authUsers = authSchema.table('users', {
        id: uuid('id').primaryKey(),
    }
);
export const agentTypeEnum = pgEnum('agent_type', ['booking', 'order','closing','greeter']);

// NOTE: The table name is "restaraunts" as specified in the prompt, which is a common typo for "restaurants".
// If the actual table name is "restaurants", please update it here.
export const restaraunts = pgTable('restaraunts', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
    name: text('name').notNull().default('default'),
    properties: jsonb('properties'),
    updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
    domain: text('domain').notNull().unique()
});

export const agentPrompts = pgTable('agent_prompts', {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
        .notNull()
        .references(() => restaraunts.id),
    agentName: agentTypeEnum('agent_name').notNull().default('booking'),
    promptText: text('prompt_text').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const menus = pgTable('menus', {
    id: uuid('id').primaryKey().defaultRandom(),
    restaurantId: uuid('restaurant_id')
        .notNull()
        .references(() => restaraunts.id),
    menuData: jsonb('menu_data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

// NOTE: The column `restaraunt_id` in `public_configurations` is assumed to be a typo for `restaurant_id`
// and is intended to be a foreign key to the `restaraunts` table.
export const publicConfigurations = pgTable('public_configurations', {
    id: uuid('id').primaryKey().defaultRandom(),
    branding: jsonb('branding').notNull(),
    restaurant: jsonb('restaurant').notNull(),
    features: jsonb('features').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    restaurantId: uuid('restaraunt_id').references(() => restaraunts.id)
});
