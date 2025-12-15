import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sendSuccess,
  sendSuccessPagination as sendSuccessPagination,
} from "../utils/response.js";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
  updateUserRole,
} from "../services/usersService.js";

export const registerHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const newUser = await createUser(req.body);
    sendSuccess(res, newUser, HttpStatusCode.Created);
  }
);

export const getMyProfileHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const user = await getUserById(req.user!.id);
    sendSuccess(res, user);
  }
);

export const updateMyUserProfileHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const user = await updateUserById(req.user!.id, req.body);
    sendSuccess(res, user);
  }
);

export const deleteMyAccountHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const result = await deleteUserById(req.user!.id);
    sendSuccess(res, result);
  }
);

export const getUsersHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const size = parseInt(req.query.size as string) || 10;
    const sort = (req.query.sort as string) || "createdAt,DESC";
    const { userList, pagination } = await getAllUsers(page, size, sort);
    sendSuccessPagination(res, userList, pagination);
  }
);

export const updateRoleHandler: RequestHandler = asyncHandler(
  async (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    const updatedUser = await updateUserRole(userId, role);
    sendSuccess(res, updatedUser);
  }
);

export const getUserHandler: RequestHandler = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id);
  const user = await getUserById(userId);
  sendSuccess(res, user);
});
