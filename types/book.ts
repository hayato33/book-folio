import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { books } from '@/db/schema';

// スキーマから自動生成される型
export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;

// ステータス型
export type BookStatus = 'pending' | 'reading' | 'completed';
