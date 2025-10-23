CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"cover_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
