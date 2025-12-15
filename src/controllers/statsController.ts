import { RequestHandler } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getTopRatedMangas, getTopReviews } from "../services/statsService.js";

export const getTopReviewsHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const topReviews = await getTopReviews(limit);
    sendSuccess(res, topReviews);
  }
);

export const getTopRatedMangasHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const topRatedMangas = await getTopRatedMangas(limit);
    sendSuccess(res, topRatedMangas);
  }
);
