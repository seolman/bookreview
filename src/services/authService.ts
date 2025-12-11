import { HttpStatusCode } from "axios";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

import { users, refreshTokens } from "../db/schema.js";
import db from "../db/index.js";
import AppError from "../utils/error.js";
import { comparePassword } from "../utils/password.js";
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

  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db
    .insert(refreshTokens)
    .values({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt,
    })
    .onConflictDoNothing();

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
      exp: number;
      [key: string]: any;
    };

    const [storedToken] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));

    if (!storedToken) {
      throw new AppError("Invalid Refresh Token", HttpStatusCode.Unauthorized);
    }

    if (decoded.exp * 1000 < Date.now()) {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));

      throw new AppError("Refresh Token Expired", HttpStatusCode.Unauthorized);
    }

    const payload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    const newAccessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return { accessToken: newAccessToken };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));
      throw new AppError("Refresh Token Expired", HttpStatusCode.Unauthorized);
    }
    throw new AppError("Invalid Refresh Token", HttpStatusCode.Unauthorized);
  }
};

export const logoutUser = async (userId: number) => {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
};
