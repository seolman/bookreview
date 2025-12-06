import { HttpStatusCode } from "axios";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { users, NewUser, User } from "../db/schema.js";
import db from "../db/index.js";
import AppError from "../utils/error.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import env from "../configs/env.js";

export const loginUser = async (email: string, password: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new AppError("Unauthorized", HttpStatusCode.Unauthorized);
  }

  const isPasswordValid = await comparePassword(password, user.hashedPassword!);
  if (!isPasswordValid) {
    throw new AppError("Unauthorized", HttpStatusCode.Unauthorized);
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  // WARN need to change if refresh added
  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });

  // TODO refresh token

  return token;
};

// TODO
export const logoutUser = async (userId: number) => {
  // delete refresh token
};
