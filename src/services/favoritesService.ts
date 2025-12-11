import { eq } from "drizzle-orm";
import { HttpStatusCode } from "axios";

import { db } from "../db/index.js";
import { favorites, mangas, users } from "../db/schema.js";
import AppError from "../utils/error.js";

export const addFavorite = async (userId: number, mangaId: number) => {
  const [manga] = await db
    .select({ id: mangas.id })
    .from(mangas)
    .where(eq(mangas.id, mangaId));

  if (!manga) {
    throw new AppError("Manga not found", HttpStatusCode.NotFound);
  }

  await db
    .insert(favorites)
    .values({
      userId,
      mangaId,
    })
    .onConflictDoNothing();
};

export const getFavoritesByManga = async (mangaId: number) => {
  const data = await db
    .select({
      id: users.id,
      username: users.username,
      avatarUrl: users.avatarUrl,
    })
    .from(favorites)
    .where(eq(favorites.mangaId, mangaId))
    .leftJoin(users, eq(favorites.userId, users.id));

  return data;
};

export const getFavoritesByUser = async (userId: number) => {
  const data = await db
    .select({
      id: mangas.id,
      malId: mangas.malId,
      title: mangas.title,
      author: mangas.author,
      synopsis: mangas.synopsis,
      publishedAt: mangas.publishedAt,
      imageUrl: mangas.imageUrl,
    })
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .leftJoin(mangas, eq(favorites.mangaId, mangas.id));

  return data;
};
