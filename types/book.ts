import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { books } from '@/db/schema';

// スキーマから自動生成される型
export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;

// ステータス型
export type BookStatus = 'pending' | 'reading' | 'completed';

// 読書スタイル型
export type ReadingStyle = 'careful' | 'quick' | 'skim' | 'reference';

// 読書スタイル表示用のラベル
export const readingStyleLabels: Record<ReadingStyle, string> = {
  careful: 'じっくり読み',
  quick: 'さらっと読み',
  skim: '流し読み',
  reference: '参照用',
};
