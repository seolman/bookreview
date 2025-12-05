import { RequestHandler } from "express";
import { ZodObject } from "zod";

const validationHandler = (schema: ZodObject): RequestHandler => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (err) {
    next(err);
  }
};

export default validationHandler;
