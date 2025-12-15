import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess, sendSuccessPagination } from "../utils/response.js";
import {
  createComment,
  deleteComment,
  getCommentsByReview,
  updateComment,
} from "../services/commentsService.js";

export const createCommentHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { content } = req.body;

    const newComment = await createComment(userId, reviewId, content);

    sendSuccess(res, newComment, HttpStatusCode.Created);
  }
);

export const getCommentsByReviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sort = (req.query.sort as string) || "createdAt,desc";

    const { comments, pagination } = await getCommentsByReview(
      reviewId,
      page,
      size,
      sort
    );

    sendSuccessPagination(res, comments, pagination);
  }
);

export const updateCommentHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const commentId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { content } = req.body;

    const updatedComment = await updateComment(commentId, userId, content);

    sendSuccess(res, updatedComment);
  }
);

export const deleteCommentHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const commentId = parseInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    await deleteComment(commentId, userId, userRole);

    res.status(HttpStatusCode.NoContent).send();
  }
);
