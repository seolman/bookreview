import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../services/authService.js";
import AppError from "../utils/error.js";

export const loginHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await loginUser(email, password);

  sendSuccess(res, { accessToken, refreshToken }, HttpStatusCode.Ok);
});

export const logoutHandler: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatusCode.Unauthorized);
  }

  await logoutUser(req.user.id);
  sendSuccess(res, null, HttpStatusCode.NoContent);
});

export const refreshHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError("Refresh Token Required", HttpStatusCode.BadRequest);
  }

  const { accessToken } = await refreshAccessToken(refreshToken);
  sendSuccess(res, { accessToken }, HttpStatusCode.Ok);
});
