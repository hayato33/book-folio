'use server';

import { db } from '@/db/drizzle';
import { books } from '@/db/schema';
import { BookStatus } from '@/types/book';
import { eq } from 'drizzle-orm';

// books一覧取得
export const getBooks = async () => {
  const data = await db.select().from(books);
  return data;
};

// 特定IDのbook情報取得
export const getBookById = async (id: number) => {
  const data = await db.select().from(books).where(eq(books.id, id));
  return data.length > 0 ? data[0] : null;
};

// book作成
export const postBook = async (title: string, coverUrl?: string, memo?: string) => {
  const result = await db
    .insert(books)
    .values({
      title,
      coverUrl: coverUrl || null,
      memo: memo || null,
    })
    .returning({ id: books.id });

  return result[0].id;
};

// book編集
export const updateBook = async (id: number, title: string, coverUrl: string | null, memo: string | null, status: BookStatus) => {
  // 現在の書籍データを取得
  const currentBook = await getBookById(id);
  if (!currentBook) {
    throw new Error('書籍が見つかりません');
  }

  let completedAt: Date | null = currentBook.completedAt;

  // ステータスがcompletedに変更された場合のみ、completedAtを現在時刻に設定
  if (status === 'completed' && currentBook.status !== 'completed') {
    completedAt = new Date();
  }
  // ステータスがcompletedから他に変更された場合、completedAtをnullに
  else if (status !== 'completed' && currentBook.status === 'completed') {
    completedAt = null;
  }
  // それ以外の場合は既存の値を保持

  const updateData = {
    title,
    coverUrl: coverUrl || null,
    memo: memo || null,
    status,
    completedAt,
  };

  await db.update(books).set(updateData).where(eq(books.id, id));
};

// book削除
export const deleteBook = async (id: number) => {
  await db.delete(books).where(eq(books.id, id));
};
