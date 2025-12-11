import { ErrorRequestHandler } from "express";
import { HttpStatusCode } from "axios";
import { ZodError } from "zod";

import AppError from "../utils/error.js";
import env from "../configs/env.js";
import logger from "../utils/logger.js";

export type MyErrorResponse = {
  success: false;
  error: {
    timestamp: Date;
    path: string;
    message: string;
    /**
     * @example 400
     **/
    status: number;
    details?: {
      [key: string]: string;
    };
  };
};

const errorhandler: ErrorRequestHandler = (err, req, res, next) => {
  let message = "Internal Server Error";
  let statusCode = HttpStatusCode.InternalServerError;
  let details: any | undefined;

  if (err instanceof AppError) {
    message = err.message;
    statusCode = err.statusCode;
    details = err.details;
  } else if (err instanceof ZodError) {
    message = err.message;
    statusCode = HttpStatusCode.UnprocessableEntity;
    details = err.issues;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (env.NODE_ENV === "development") {
    console.error(err);
  } else {
    logger.error(
      `Path: ${req.path}, Error: ${err.message}, Stack: ${err.stack}`
    );
  }

  res.status(statusCode).json({
    success: false,
    error: {
      timestamp: new Date(),
      path: req.path,
      message,
      status: statusCode,
      ...(details && { details }),
    },
  });
};

export default errorhandler;
