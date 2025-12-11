import { and, asc, count, desc, eq } from "drizzle-orm";
import { HttpStatusCode } from "axios";

import { db } from "../db/index.js";
import { reviews, users, mangas } from "../db/schema.js";
import AppError from "../utils/error.js";

type CreateReviewPayload = {
  rating: number;
  content: string;
};

export const createReview = async (
  userId: number,
  mangaId: number,
  payload: CreateReviewPayload
) => {
  const [existingReview] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.mangaId, mangaId)));

  if (existingReview) {
    throw new AppError(
      "User has already reviewed this manga",
      HttpStatusCode.Conflict
    );
  }

  const [newReview] = await db
    .insert(reviews)
    .values({
      userId,
      mangaId,
      rating: payload.rating,
      content: payload.content,
    })
    .returning();

  return newReview;
};

export const getReviewsByManga = async (
  mangaId: number,
  page: number,
  size: number,
  sort: string
) => {
  const [total] = await db
    .select({ value: count() })
    .from(reviews)
    .where(eq(reviews.mangaId, mangaId));

  const totalPages = Math.ceil(total.value / size) || 1;
  if (page > totalPages) {
    throw new AppError(
      `Request page is out of bounds. The last page is ${totalPages}`,
      HttpStatusCode.BadRequest
    );
  }

  const [field, order] = sort.split(",");
  const sortOrderFunc = order?.toLowerCase() === "asc" ? asc : desc;

  const sortableColumns: Record<string, any> = {
    createdAt: reviews.createdAt,
    rating: reviews.rating,
  };

  const orderByColumn = sortableColumns[field] || reviews.createdAt;

  const data = await db
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
    })
    .from(reviews)
    .where(eq(reviews.mangaId, mangaId))
    .leftJoin(users, eq(reviews.userId, users.id))
    .limit(size)
    .offset((page - 1) * size)
    .orderBy(sortOrderFunc(orderByColumn));

  const pagination = {
    page,
    size,
    totalElements: total.value,
    totalPages,
    sort,
  };

  return {
    reviews: data,
    pagination,
  };
};

export const getReviewById = async (reviewId: number) => {
  const [data] = await db
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
    .where(eq(reviews.id, reviewId))
    .leftJoin(users, eq(reviews.userId, users.id))
    .leftJoin(mangas, eq(reviews.mangaId, mangas.id));

  if (!data) {
    throw new AppError("Review not found", HttpStatusCode.NotFound);
  }

  return data;
};

export const updateReview = async (
  reviewId: number,
  userId: number,
  payload: Partial<CreateReviewPayload>
) => {
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  if (!review) {
    throw new AppError("Review not found", HttpStatusCode.NotFound);
  }

  if (review.userId !== userId) {
    throw new AppError(
      "Forbidden: You can only update your own reviews",
      HttpStatusCode.Forbidden
    );
  }

  const [updatedReview] = await db
    .update(reviews)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(eq(reviews.id, reviewId))
    .returning();

  return updatedReview;
};

export const deleteReview = async (
  reviewId: number,
  userId: number,
  userRole: string
) => {
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  if (!review) {
    throw new AppError("Review not found", HttpStatusCode.NotFound);
  }

  if (review.userId !== userId && userRole !== "admin") {
    throw new AppError(
      "Forbidden: You can only delete your own reviews",
      HttpStatusCode.Forbidden
    );
  }

  await db.delete(reviews).where(eq(reviews.id, reviewId));
};

export const getReviewsByUser = async (
  userId: number,
  page: number,
  size: number,
  sort: string
) => {
  const [total] = await db
    .select({ value: count() })
    .from(reviews)
    .where(eq(reviews.userId, userId));

  const totalPages = Math.ceil(total.value / size) || 1;
  if (page > totalPages) {
    throw new AppError(
      `Request page is out of bounds. The last page is ${totalPages}`,
      HttpStatusCode.BadRequest
    );
  }

  const [field, order] = sort.split(",");
  const sortOrderFunc = order?.toLowerCase() === "asc" ? asc : desc;

  const sortableColumns: Record<string, any> = {
    createdAt: reviews.createdAt,
    rating: reviews.rating,
  };

  const orderByColumn = sortableColumns[field] || reviews.createdAt;

  const data = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      createdAt: reviews.createdAt,
      updatedAt: reviews.updatedAt,
      manga: {
        id: mangas.id,
        title: mangas.title,
        imageUrl: mangas.imageUrl,
      },
    })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .leftJoin(mangas, eq(reviews.mangaId, mangas.id))
    .limit(size)
    .offset((page - 1) * size)
    .orderBy(sortOrderFunc(orderByColumn));

  const pagination = {
    page,
    size,
    totalElements: total.value,
    totalPages,
    sort,
  };

  return {
    reviews: data,
    pagination,
  };
};
