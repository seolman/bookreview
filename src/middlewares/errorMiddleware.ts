import { NextFunction, Request, Response } from "express";

const errorhandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export default errorhandler;
