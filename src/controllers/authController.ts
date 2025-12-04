import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

// TODO
export const loginController: RequestHandler = asyncHandler(async (req, res) => {
  sendSuccess(res, {}, HttpStatusCode.Ok, "Ok");
});

// TODO
export const logoutController: RequestHandler = asyncHandler(async (req, res) => {
});

// TODO
export const refreshController: RequestHandler = asyncHandler(async (req, res) => {

});
