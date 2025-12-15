import {
  integer,
  pgTable as table,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  check,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = table("users", {
  id: serial("id").primaryKey().notNull(),
  username: varchar("username", { length: 256 }).unique(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  hashedPassword: text("hashed_password"),
  avatarUrl: varchar("avatar_url", { length: 512 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const oauth = table(
  "oauth",
  {
    provider: varchar("provider", { length: 256 }).notNull(),
    providerUserId: varchar("provider_user_id", { length: 256 }).notNull(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerUserId] })]
);

export type NewManga = typeof mangas.$inferInsert;
export type Manga = typeof mangas.$inferSelect;

export const mangas = table("mangas", {
  id: serial("id").primaryKey(),
  malId: integer("mal_id").unique().notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  author: varchar("author", { length: 256 }),
  synopsis: text("synopsis"),
  publishedAt: timestamp("published_at").notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type NewReview = typeof reviews.$inferInsert;
export type Review = typeof reviews.$inferSelect;

export const reviews = table(
  "reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    mangaId: integer("manga_id")
      .references(() => mangas.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull().default(0),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // unique().on(table.userId, table.mangaId),
    check("review_rating_check", sql`${t.rating} >= 1 and ${t.rating} <= 5`),
  ]
);

export type NewComment = typeof comments.$inferInsert;
export type Comment = typeof comments.$inferSelect;

export const comments = table("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  reviewId: integer("review_id")
    .references(() => reviews.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const favorites = table(
  "favorites",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mangaId: integer("manga_id")
      .notNull()
      .references(() => mangas.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mangaId] })]
);

export const refreshTokens = table("refresh_tokens", {
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
