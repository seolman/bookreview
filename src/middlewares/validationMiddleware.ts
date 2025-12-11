import { RequestHandler } from "express";
import { ZodObject } from "zod";

export const validationMiddleware =
  (schema: ZodObject): RequestHandler =>
  (req, _res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      next(err);
    }
  };
