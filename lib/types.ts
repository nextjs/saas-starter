import type {
    Restaraunt,
    PublicConfiguration,
    Menu,
    AgentPrompt
} from '@/lib/db/schema';

export interface MenuItem {
    id: string;
    name: Record<string, string>; // e.g., { "en": "Spicy Tuna Roll", "es": "Rollo de Atún Picante" }
    description: Record<string, string>;
    price: number;
    category: string;
    image_url?: string;
    available: boolean;
}

export interface MenuCategory {
    id: string;
    name: Record<string, string>;
    description: Record<string, string>;
}

export interface MenuSchema {
    categories: Record<string, MenuCategory>;
    items: MenuItem[];
}

export type RestaurantDetails = Restaraunt & {
    publicConfigurations: PublicConfiguration[];
    menus: Menu[];
    agentPrompts: AgentPrompt[];
};