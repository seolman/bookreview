import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import AppError from "../utils/error.js";
import { userRoleEnum } from "src/db/schema.js";

type UserRoles = (typeof userRoleEnum.enumValues)[number];

export const authorizeRoles = (roles: UserRoles[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Forbidden", HttpStatusCode.Forbidden);
    }
    next();
  };
};
