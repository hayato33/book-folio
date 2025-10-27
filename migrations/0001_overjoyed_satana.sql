ALTER TABLE "books" ADD COLUMN "memo" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "completed_at" timestamp;