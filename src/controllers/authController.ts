import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";
import z from "zod";

import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { loginUser, registerUser } from "../services/authService.js";

export const registerHandler: RequestHandler = asyncHandler(async (req, res) => {
  const newUser = await registerUser(req.body);
  sendSuccess(res, newUser, HttpStatusCode.Created);
});

export const loginHandler: RequestHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const token = await loginUser(email, password);

  sendSuccess(res, { token }, HttpStatusCode.Ok);
});

// TODO
export const logoutHandler: RequestHandler = asyncHandler(async (req, res) => {
});

// TODO
export const refreshHandler: RequestHandler = asyncHandler(async (req, res) => {

});
