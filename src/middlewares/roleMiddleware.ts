import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";

import AppError from "../utils/error.js";

// TODO define type
export const authorizeRoles = (roles: ["admin" | "user"]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError("Forbidden", HttpStatusCode.Forbidden);
    }
    next();
  };
};
