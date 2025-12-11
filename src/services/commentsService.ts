import { count, eq, asc, desc } from "drizzle-orm";
import { HttpStatusCode } from "axios";

import { db } from "../db/index.js";
import { comments, reviews, users } from "../db/schema.js";
import AppError from "../utils/error.js";

export const createComment = async (
  userId: number,
  reviewId: number,
  content: string
) => {
  const [review] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.id, reviewId));

  if (!review) {
    throw new AppError("Review not found", HttpStatusCode.NotFound);
  }

  const [newComment] = await db
    .insert(comments)
    .values({
      content,
      userId,
      reviewId,
    })
    .returning();

  return newComment;
};

export const getCommentsByReview = async (
  reviewId: number,
  page: number,
  size: number,
  sort: string
) => {
  const [total] = await db
    .select({ value: count() })
    .from(comments)
    .where(eq(comments.reviewId, reviewId));

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
    createdAt: comments.createdAt,
  };

  const orderByColumn = sortableColumns[field] || comments.createdAt;

  const data = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      user: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
      },
    })
    .from(comments)
    .where(eq(comments.reviewId, reviewId))
    .leftJoin(users, eq(comments.userId, users.id))
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
    comments: data,
    pagination,
  };
};

export const updateComment = async (
  commentId: number,
  userId: number,
  content: string
) => {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!comment) {
    throw new AppError("Comment not found", HttpStatusCode.NotFound);
  }

  if (comment.userId !== userId) {
    throw new AppError(
      "Forbidden: You can only update your own comments",
      HttpStatusCode.Forbidden
    );
  }

  const [updatedComment] = await db
    .update(comments)
    .set({ content, updatedAt: new Date() })
    .where(eq(comments.id, commentId))
    .returning();

  return updatedComment;
};

export const deleteComment = async (
  commentId: number,
  userId: number,
  userRole: string
) => {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!comment) {
    throw new AppError("Comment not found", HttpStatusCode.NotFound);
  }

  if (comment.userId !== userId && userRole !== "admin") {
    throw new AppError(
      "Forbidden: You can only delete your own comments",
      HttpStatusCode.Forbidden
    );
  }

  await db.delete(comments).where(eq(comments.id, commentId));
};
