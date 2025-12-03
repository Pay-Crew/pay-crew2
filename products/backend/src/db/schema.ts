import { serial, pgTable, varchar, integer } from 'drizzle-orm/pg-core';

export const history = pgTable('history', {
  id: serial('id').primaryKey(),
  from: varchar('from').notNull(),
  to: varchar('to').notNull(),
  amount: integer('amount').notNull(),
});
