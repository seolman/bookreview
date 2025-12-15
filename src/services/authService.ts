import axios, { HttpStatusCode } from "axios";
import { eq, and } from "drizzle-orm";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";

import { users, refreshTokens, User, oauth } from "../db/schema.js";
import { db } from "../db/index.js";
import AppError from "../utils/error.js";
import { comparePassword } from "../utils/password.js";
import env from "../configs/env.js";

export const generateAppTokens = async (user: User) => {
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
    .onConflictDoUpdate({
      target: refreshTokens.token,
      set: { expiresAt: refreshTokenExpiresAt },
    });

  return { accessToken, refreshToken };
};

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

export const googleLogin = async (code: string) => {
  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    {
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }
  );
  const { access_token: token } = tokenResponse.data;
  if (!token) {
    throw new AppError(
      "Internal Server Error",
      HttpStatusCode.InternalServerError
    );
  }

  const profileResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const profile = profileResponse.data;
  if (!profile.email) {
    throw new AppError(
      "Internal Server Error",
      HttpStatusCode.InternalServerError
    );
  }

  const [data] = await db
    .select()
    .from(oauth)
    .leftJoin(users, eq(users.id, oauth.userId))
    .where(
      and(eq(oauth.providerUserId, profile.id), eq(oauth.provider, "google"))
    );

  let user: User | undefined;
  if (data && data.users) {
    user = data.users;
  } else {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email));
    if (existingUser) {
      await db.insert(oauth).values({
        provider: "google",
        providerUserId: profile.id,
        userId: existingUser.id,
      });
      user = existingUser;
    } else {
      await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: profile.email,
            username: profile.name,
            avatarUrl: profile.picture,
          })
          .returning();

        await tx.insert(oauth).values({
          provider: "google",
          providerUserId: profile.id,
          userId: newUser.id,
        });

        user = newUser;
      });
    }
  }

  if (!user) {
    throw new AppError(
      "Internal Server Error",
      HttpStatusCode.InternalServerError
    );
  }
  const { accessToken, refreshToken } = await generateAppTokens(user);
  return { accessToken, refreshToken };
};

export const firebaseLogin = async (idToken: string) => {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const [result] = await db
    .select()
    .from(oauth)
    .leftJoin(users, eq(oauth.userId, users.id))
    .where(and(
      eq(oauth.provider, decodedToken.firebase.sign_in_provider),
      eq(oauth.providerUserId, decodedToken.uid)
    ));

  let user: User | undefined;
  if (result && result.users) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, decodedToken.email!));
    if (existingUser) {
      await db.insert(oauth).values({
        provider: decodedToken.firebase.sign_in_provider,
        providerUserId: decodedToken.uid,
        userId: existingUser.id
      });
      user = existingUser;
    } else {
      await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(users)
          .values({
            email: decodedToken.email!,
            username: decodedToken.name,
            avatarUrl: decodedToken.picture,
          })
          .returning();

        await tx.insert(oauth).values({
          provider: "google",
          providerUserId: decodedToken.id,
          userId: newUser.id,
        });

        user = newUser;
      })
    }
  }

  if (!user) {
    throw new AppError("Internal Server Error", HttpStatusCode.InternalServerError);
  }
  const tokens = await generateAppTokens(user);

  return tokens;
};
