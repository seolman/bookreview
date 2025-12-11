import { asc, desc, eq, gt, sql } from "drizzle-orm";

import db from "../db/index.js";
import { reviews, users, mangas } from "../db/schema.js";

export const getTopReviews = async (limit: number = 10) => {
  const topReviews = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
      manga: {
        id: mangas.id,
        title: mangas.title,
        imageUrl: mangas.imageUrl,
      },
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(mangas, eq(reviews.mangaId, mangas.id))
    .where(gt(reviews.rating, 3))
    .orderBy(desc(reviews.rating), desc(reviews.createdAt))
    .limit(limit);

  return topReviews;
};

export const getTopRatedMangas = async (limit: number = 10) => {
  const topRatedMangas = await db
    .select({
      id: mangas.id,
      title: mangas.title,
      imageUrl: mangas.imageUrl,
      averageRating: sql<number>`avg(${reviews.rating})`
        .mapWith(Number)
        .as("average_rating"),
    })
    .from(mangas)
    .leftJoin(reviews, eq(mangas.id, reviews.mangaId))
    .groupBy(mangas.id, mangas.title, mangas.imageUrl)
    .orderBy(sql`average_rating DESC`)
    .limit(limit);

  return topRatedMangas;
};
