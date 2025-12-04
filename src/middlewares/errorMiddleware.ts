import { ErrorRequestHandler } from "express";

import AppError from "../utils/error.js";

// TODO
const errorhandler: ErrorRequestHandler = (err, req, res, next) => {

  if (err instanceof AppError) {

  }

  res.status(500).json({
    success: false,
    error: {}
  });
};

export default errorhandler;
