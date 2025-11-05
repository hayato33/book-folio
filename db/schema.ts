import { serial, text, timestamp, pgTable } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  coverUrl: text('cover_url'),
  memo: text('memo'),
  status: text('status', {
    enum: ['pending', 'reading', 'completed'],
  })
    .default('pending')
    .notNull(),
  readingStyle: text('reading_style', {
    enum: ['careful', 'quick', 'skim', 'reference'],
  }),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
