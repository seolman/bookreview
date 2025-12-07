import { asc, count, desc, eq } from "drizzle-orm";
import { HttpStatusCode } from "axios";

import db from "../db/index.js";
import { NewUser, users } from "../db/schema.js";
import AppError from "../utils/error.js";
import { hashPassword } from "../utils/password.js";

export const createUser = async (newUser: NewUser) => {
  const { email, hashedPassword: password } = newUser;
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser) {
    throw new AppError("Conflict", HttpStatusCode.Conflict);
  }

  const hashedPassword = await hashPassword(password!);

  const [user] = await db
    .insert(users)
    .values({
      email,
      hashedPassword,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
    });

  return user;
};

export const getUserById = async (userId: number) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      avatarUrl: users.avatarUrl,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new AppError("Bad Request", HttpStatusCode.BadRequest);
  }

  return user;
};

export const updateUserById = async (
  userId: number,
  updateData: Partial<NewUser>
) => {
  const { username, avatarUrl } = updateData;

  const [user] = await db
    .update(users)
    .set({
      username,
      avatarUrl,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      username: users.username,
      avatarUrl: users.avatarUrl,
      role: users.role,
    });

  if (!user) {
    throw new AppError("Bad Request", HttpStatusCode.BadRequest);
  }

  return user;
};

export const deleteUserById = async (userId: number) => {
  await db.delete(users).where(eq(users.id, userId));
  return { message: "user deleted" };
};

export const getAllUsers = async (page: number, size: number, sort: string) => {
  const [total] = await db.select({ value: count() }).from(users);
  const totalPages = Math.ceil(total.value / size) || 1;
  if (page > totalPages) {
    throw new AppError("Bad Requset", HttpStatusCode.BadRequest);
  }

  const [field, order] = sort.split(",");
  const sortOrder = order?.toLowerCase() === "asc" ? asc : desc;

  const sortableColumns: Record<string, any> = {
    createdAt: users.createdAt,
    username: users.username,
  };

  const orderBy = sortableColumns[field] || users.createdAt;

  const userList = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .limit(size)
    .offset((page - 1) * size)
    .orderBy(sortOrder(orderBy));

  const pagination = {
    page,
    size,
    totalElements: total.value,
    totalPages,
    sort,
  };

  return {
    userList,
    pagination,
  };
};

export const updateUserRole = async (
  userId: number,
  newRole: "user" | "admin"
) => {
  const [updatedUser] = await db
    .update(users)
    .set({
      role: newRole,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      role: users.role,
    });

  if (!updatedUser) {
    throw new AppError("Bad Request", HttpStatusCode.BadRequest);
  }

  return updatedUser;
};
