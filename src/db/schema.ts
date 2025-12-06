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
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

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
    .$onUpdate(() => new Date())
});

// TODO oauth
// export const oauth = table("oauth", {
//   providerId: varchar("provider_id", { length: 256 }).notNull(),
//   providerUserId: varchar("provider_"),
//   userId: integer("user_id").references(() => users.id).notNull()
// }, (t) => ({
// }));

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
    .$onUpdate(() => new Date())
});

export const reviews = table("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  mangaId: integer("manga_id")
    .references(() => mangas.id, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
}, (t) => [
  // unique().on(table.userId, table.mangaId),
  check(
    "review_rating_check",
    sql`${t.rating} >= 1 and ${t.rating} <= 5`
  )
]);

export const comments = table("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer(),
  reviewId: integer(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export const favorites = table("favorites", {
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mangaId: integer("manga_id")
    .notNull()
    .references(() => mangas.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull()
},
  (t) => [primaryKey({ columns: [t.userId, t.mangaId] })]
);

// TODO refresh token
// export const refreshTokens = table("refresh_tokens", {

// });
