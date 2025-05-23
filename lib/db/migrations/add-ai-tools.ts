import { sql } from 'drizzle-orm';
import { pgTable, serial, varchar, text, timestamp, json } from 'drizzle-orm/pg-core';

export const aiTools = pgTable('ai_tools', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  url: text('url'),
  price_model: varchar('price_model', { length: 50 }),
  price: varchar('price', { length: 50 }),
  billing: varchar('billing', { length: 50 }),
  refund: varchar('refund', { length: 50 }),
  tags: json('tags').$type<string[]>(),
  type: varchar('type', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export async function up(db: any) {
  await db.schema.createTable(aiTools);
  
  // Add CoWriter AI as initial data
  await db.insert(aiTools).values({
    name: 'CoWriter AI',
    description: 'CoWriter AI is an AI-driven writing assistance tool designed for individuals and teams across various fields including academic research, content creation, technical writing, business communication, creative writing, marketing, advertising, and legal documentation. It aims to increase writing efficiency, stimulate originality, save time, and offer versatility, catering to both formal and informal content creation. Integral features of CoWriter AI include AI-powered autocomplete for real-time writing assistance, citation formatting aid in APA, MLA, IEEE, and Harvard styles, and a bibliography library for managing research materials. The tool also provides adaptability across writing styles and tones, and aids in structuring documents through an Outline Builder. CoWriter also offers collaborative features for team work which include real-time editing and commenting on documents and folder sharing among up to five users. The tool aims to innovatively shape the future of writing across different domains by addressing individual needs including overcoming writers block, generating fresh content, accurately citing sources, among other functions.',
    url: 'https://theresanaifthat.com/ai/cowriter-ai/',
    price_model: 'Paid',
    price: '$19/month',
    billing: 'Monthly',
    refund: 'Unknown',
    tags: ['AI Automation', 'Video Creation', 'TikTok'],
    type: 'Tik Tok'
  });
}

export async function down(db: any) {
  await db.schema.dropTable(aiTools);
} 