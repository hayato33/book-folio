# 📘 BookFolio 仕様書

## 🧩 概要

CoverLog は、「読んだ書籍を記録し、Amazon から表紙画像を自動取得して可視化する」個人用 Web アプリ。
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

## 🧱 機能一覧（MVP）

| 機能                | 内容                                            |
| ------------------- | ----------------------------------------------- |
| 📥 書籍登録フォーム | 書籍タイトルを入力し、Amazon から表紙を自動取得 |
| 🖼️ 表紙プレビュー   | スクレイピング結果を即座に表示                  |
| 💾 保存機能         | 書籍タイトル＋表紙 URL を DB に保存             |
| 📚 一覧表示         | 登録済みの書籍をカード形式で表示                |
| 🗑️ 削除機能         | 登録済み書籍の削除（任意）                      |

## 📂 ディレクトリ構成（予定）

```
coverlog/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  // メイン画面（書籍登録フォーム＋一覧）
│   ├── books/
│   │   └── page.tsx              // 書籍一覧ページ（後で分離予定）
│   └── api/
│       ├── fetch-cover/route.ts  // PuppeteerでAmazonから表紙取得
│       └── books/route.ts        // DB操作（GET/POST）
│
├── db/
│   ├── schema.ts                 // Drizzleスキーマ定義
│   ├── index.ts                  // DBクライアント
│   └── drizzle.config.ts         // 設定ファイル
│
├── components/
│   ├── ui/                       // shadcn/uiの生成物
│   └── BookCard.tsx              // 一覧表示用カードコンポーネント
│
├── styles/
│   └── globals.css
│
├── .env
├── drizzle.config.ts
├── package.json
└── README.md
```

## 🧮 データモデル

### books テーブル

| カラム名   | 型        | 内容         |
| ---------- | --------- | ------------ |
| id         | serial    | 主キー       |
| title      | text      | 書籍タイトル |
| cover_url  | text      | 表紙画像 URL |
| created_at | timestamp | 登録日時     |

```typescript
// db/schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  coverUrl: text('cover_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
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

**Request**

```json
{ "title": "ハリーポッター" }
```

**Response**

```json
{ "coverUrl": "https://images-na.ssl-images-amazon.com/xxx.jpg" }
```

### 2️⃣ /api/books

| メソッド | 用途                   |
| -------- | ---------------------- |
| GET      | 登録済み書籍の一覧取得 |
| POST     | 新規書籍の登録         |
| DELETE   | 書籍削除（任意）       |

## 💅 UI 設計（shadcn/ui）

| ページ | コンポーネント構成                                 |
| ------ | -------------------------------------------------- |
| /      | Input + Button + Card                              |
| /books | BookCard のグリッド表示                            |
| 全体   | Tailwind でレイアウト、max-w-xl mx-auto で中央寄せ |

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
