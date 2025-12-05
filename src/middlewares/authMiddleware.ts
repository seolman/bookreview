import { RequestHandler } from "express";
import { HttpStatusCode } from "axios";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/error.js";
import env from "../configs/env.js";
import db from "../db/index.js";
import { users } from "../db/schema.js";

declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
    }
  }
}

const authHandler: RequestHandler = asyncHandler(async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", HttpStatusCode.Unauthorized);
  }

  // decode token
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number;[key: string]: any };
    // find user
    const [user] = await db.select().from(users).where(eq(users.id, decoded.id));
    if (!user) {
      throw new AppError("", HttpStatusCode.Unauthorized);
    }

    // add user to req
    req.user = user;
    next();
  } catch (err) {
    throw new AppError("", HttpStatusCode.Unauthorized);
  }
});

export default authHandler;
