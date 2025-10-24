# 📘 BookFolio 仕様書

## 🧩 概要

BookFolio は、「読んだ書籍を記録し、Amazon から表紙画像を自動取得して可視化する」個人用 Web アプリ。
技術学習（スクレイピング × フルスタック構成）を目的とした MVP（最小実装版）です。

## 🎯 目的

- Puppeteer を使用したスクレイピングの理解と実践
- Next.js（App Router）を中心としたフルスタック開発の練習
- Drizzle ORM ＋ Neon（PostgreSQL）による型安全な DB 操作
- Tailwind + shadcn/ui による UI 構築の効率化

## ⚙️ 技術スタック

| カテゴリ       | 技術                                | 用途                             |
| -------------- | ----------------------------------- | -------------------------------- |
| フロント       | Next.js 15 (App Router, TypeScript) | フロント＆API 統合フレームワーク |
| スタイリング   | Tailwind CSS + shadcn/ui            | UI 構築                          |
| DB             | PostgreSQL（Neon）                  | データ永続化                     |
| ORM            | Drizzle ORM                         | 型安全な DB 操作                 |
| スクレイピング | Puppeteer                           | Amazon から表紙画像を取得        |
| デプロイ       | Vercel（Node.js ランタイム）        | サーバーレス運用                 |
| パッケージ管理 | pnpm                                | 高速ビルド＆依存関係管理         |

## 📄 ページ構成

| ページ      | パス               | 内容                                 |
| ----------- | ------------------ | ------------------------------------ |
| 📚 書籍一覧 | `/`                | 登録済み書籍をカード形式で表示・管理 |
| ➕ 書籍追加 | `/books/add`       | 新規書籍の登録フォーム               |
| ✏️ 書籍編集 | `/books/[id]/edit` | 既存書籍の情報編集フォーム           |

## 🧱 機能一覧（MVP）

| 機能                | 内容                                         |
| ------------------- | -------------------------------------------- |
| 📚 書籍一覧表示     | 登録済み書籍をステータス別にカード形式で表示 |
| ➕ 書籍追加フォーム | 書籍情報を入力し、Amazon から表紙を自動取得  |
| ✏️ 書籍編集フォーム | 既存書籍の情報（メモ、ステータス等）を編集   |
| 🖼️ 表紙プレビュー   | スクレイピング結果を即座に表示               |
| 💾 保存機能         | 書籍情報を DB に保存                         |
| 🗑️ 削除機能         | 登録済み書籍の削除                           |
| 📊 ステータス管理   | 未完了・進行中・完了の読書ステータス管理     |

## 📂 ディレクトリ構成

```plaintext
book-folio/
├── app/
│   ├── layout.tsx                // 全体レイアウト
│   ├── page.tsx                  // 書籍一覧ページ（メイン画面）
│   ├── globals.css               // グローバルスタイル
│   ├── books/
│   │   ├── add/
│   │   │   └── page.tsx          // 書籍追加ページ
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx      // 書籍編集ページ
│   └── api/
│       ├── fetch-cover/
│       │   └── route.ts          // PuppeteerでAmazonから表紙取得
│       └── books/
│           └── route.ts          // DB操作（GET/POST/PUT/DELETE）
│
├── actions/
│   └── booksAction.ts            // Server Actions（書籍操作）
│
├── components/
│   ├── ui/                       // shadcn/uiコンポーネント
│   ├── BookCard.tsx              // 書籍カードコンポーネント
│   ├── BookForm.tsx              // 書籍フォームコンポーネント
│   └── StatusBadge.tsx           // ステータス表示バッジ
│
├── db/
│   ├── schema.ts                 // Drizzleスキーマ定義
│   └── drizzle.ts                // DBクライアント設定
│
├── migrations/                   // DBマイグレーションファイル
│
├── scripts/
│   └── testPuppeteer.ts          // Puppeteer動作検証スクリプト
│
├── docs/
│   └── specification.md          // 仕様書
│
├── .env                          // 環境変数
├── drizzle.config.ts             // Drizzle設定
├── package.json
├── tsconfig.json
└── README.md
```

## 🧮 データモデル

### books テーブル

| カラム名     | 型        | 内容                                            |
| ------------ | --------- | ----------------------------------------------- |
| id           | serial    | 主キー                                          |
| title        | text      | 書籍タイトル（書籍名）                          |
| memo         | text      | ひとことメモ                                    |
| cover_url    | text      | 表紙画像 URL                                    |
| status       | text      | ステータス（'pending', 'reading', 'completed'） |
| completed_at | timestamp | 読了日                                          |
| created_at   | timestamp | 登録日時                                        |
| updated_at   | timestamp | 更新日時                                        |

```typescript
// db/schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  memo: text('memo'),
  coverUrl: text('cover_url'),
  status: text('status', {
    enum: ['pending', 'reading', 'completed'],
  })
    .default('pending')
    .notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ステータスの型定義
export type BookStatus = 'pending' | 'reading' | 'completed';

// ステータス表示用のラベル
export const statusLabels: Record<BookStatus, string> = {
  pending: '未完了',
  reading: '進行中',
  completed: '完了',
};
```

## 🔍 スクレイピング仕様（Puppeteer）

- **検索対象**: `https://www.amazon.co.jp/s?k=<タイトル>`
- **取得要素**: 最初にヒットした商品画像の `img.s-image` の `src`
- **タイムアウト対策**: `waitUntil: "networkidle0"`
- **headless モードで起動**

## 🧩 API 設計

### 1️⃣ /api/fetch-cover

Amazon から表紙を取得

| メソッド | 用途                                |
| -------- | ----------------------------------- |
| POST     | タイトルを受け取り、表紙 URL を返す |

### Request

```json
{ "title": "ハリーポッター" }
```

### Response

```json
{ "coverUrl": "https://images-na.ssl-images-amazon.com/xxx.jpg" }
```

### 2️⃣ /api/books

| メソッド | 用途                   | 説明                                     |
| -------- | ---------------------- | ---------------------------------------- |
| GET      | 登録済み書籍の一覧取得 | ステータス別フィルタリング対応           |
| POST     | 新規書籍の登録         | タイトル、メモ、表紙 URL、ステータス保存 |
| PUT      | 書籍情報の更新         | メモ、ステータス、読了日の更新           |
| DELETE   | 書籍削除               | 指定 ID の書籍を削除                     |

#### GET /api/books レスポンス例

```json
{
  "books": [
    {
      "id": 1,
      "title": "リーダブルコード",
      "memo": "とても参考になった",
      "coverUrl": "https://images-amazon.com/xxx.jpg",
      "status": "completed",
      "completedAt": "2024-01-15T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### POST /api/books リクエスト例

```json
{
  "title": "Clean Code",
  "memo": "次に読みたい本",
  "coverUrl": "https://images-amazon.com/yyy.jpg",
  "status": "pending"
}
```

## 💅 UI 設計（shadcn/ui）

| ページ                    | コンポーネント構成                                        |
| ------------------------- | --------------------------------------------------------- |
| `/` (書籍一覧)            | Header + StatusFilter + BookCard Grid + FloatingAddButton |
| `/books/add` (追加)       | BookForm + CoverPreview + SubmitButton                    |
| `/books/[id]/edit` (編集) | BookForm (編集モード) + StatusSelect + DatePicker         |

### コンポーネント詳細

#### BookCard

- 表紙画像 + タイトル + メモ（一部）+ ステータスバッジ
- 編集・削除ボタン

#### BookForm

- タイトル入力 + メモ入力 + 表紙プレビュー
- ステータス選択 + 読了日選択（完了時のみ）

#### StatusBadge

- ステータス別の色分け表示
- 未完了: グレー、進行中: ブルー、完了: グリーン

#### レイアウト

- 全体: `max-w-6xl mx-auto` で中央寄せ
- グリッド: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` でレスポンシブ
- カード: `hover:shadow-lg transition-shadow` でインタラクション

## 🚀 開発ステップ概要

1. **環境構築**

   - pnpm / Tailwind / shadcn / Drizzle / Neon 設定

2. **DB スキーマ定義＆マイグレーション**

3. **Puppeteer セットアップ＆スクレイピング API 実装**

4. **フロントのフォーム実装**

   - 書籍タイトル入力 → API 呼び出し → 画像プレビュー表示

5. **DB 登録・一覧表示機能の実装**

6. **デプロイ設定（Vercel）**
   - Node.js ランタイム指定（Puppeteer 用）

## 🧠 今後の拡張案

- 書籍に感想・要約・タグを追加
- OpenAI API で自動要約
- Google Books API 対応（合法 API モード）
- ダークモード対応（shadcn theme）
- Supabase Storage 等で画像キャッシュ

## ✅ 想定成果物

- 1 ページ完結の学習用アプリ
- Puppeteer でスクレイピングを安全に体験
- Drizzle + Neon + Next.js のフルスタック構成の理解
- shadcn/ui を使った UI 構築の実践
