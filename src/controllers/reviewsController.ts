import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess, sendSuccessPagenation } from "../utils/response.js";
import {
  createReview,
  deleteReview,
  getReviewById,
  getReviewsByManga,
  getReviewsByUser,
  updateReview,
} from "../services/reviewsService.js";

export const createReviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { rating, content } = req.body;

    const newReview = await createReview(userId, mangaId, { rating, content });

    sendSuccess(res, newReview, HttpStatusCode.Created);
  }
);

export const getReviewsByMangaHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const mangaId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sort = (req.query.sort as string) || "createdAt,desc";

    const { reviews, pagination } = await getReviewsByManga(
      mangaId,
      page,
      size,
      sort
    );

    sendSuccessPagenation(res, reviews, pagination);
  }
);

export const getReviewByIdHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const review = await getReviewById(reviewId);
    sendSuccess(res, review);
  }
);

export const updateReviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const userId = req.user!.id;
    const payload = req.body;

    const updatedReview = await updateReview(reviewId, userId, payload);

    sendSuccess(res, updatedReview);
  }
);

export const deleteReviewHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const reviewId = parseInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    await deleteReview(reviewId, userId, userRole);

    res.status(HttpStatusCode.NoContent).send();
  }
);

export const getReviewsByUserHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sort = (req.query.sort as string) || "createdAt,desc";

    const { reviews, pagination } = await getReviewsByUser(
      userId,
      page,
      size,
      sort
    );

    sendSuccessPagenation(res, reviews, pagination);
  }
);
