import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";
import z from "zod";

import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { loginUser, logoutUser } from "../services/authService.js";
import AppError from "../utils/error.js";


export const loginHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const token = await loginUser(email, password);

  sendSuccess(res, { token }, HttpStatusCode.Ok);
});

// TODO
export const logoutHandler: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", HttpStatusCode.Unauthorized);
  }

  await logoutUser(req.user.id);
  sendSuccess(res, null, HttpStatusCode.Ok);
});

// TODO
export const refreshHandler: RequestHandler = asyncHandler(async (req, res) => {

});
