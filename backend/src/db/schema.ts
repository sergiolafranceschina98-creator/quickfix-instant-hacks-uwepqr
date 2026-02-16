import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const savedHacks = pgTable('saved_hacks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  category: text('category').notNull(),
  problem: text('problem').notNull(),
  solution: text('solution').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});