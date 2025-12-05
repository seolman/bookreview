import { RequestHandler } from "express";

import AppError from "../utils/error.js";
import { HttpStatusCode } from "axios";

const adminOnly: RequestHandler = (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new AppError("Forbidden", HttpStatusCode.Forbidden);
  }
  next();
};

export default adminOnly;
