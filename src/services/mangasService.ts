import { count, eq } from "drizzle-orm";
import { HttpStatusCode } from "axios";

import { db } from "../db/index.js";
import { mangas } from "../db/schema.js";
import AppError from "../utils/error.js";

export const getMangaById = async (id: number) => {
  const [manga] = await db.select().from(mangas).where(eq(mangas.id, id));
  if (!manga) {
    throw new AppError("Not Found", HttpStatusCode.NotFound);
  }

  return manga;
};

export const getMangas = async (page: number, size: number) => {
  const data = await db.select().from(mangas).limit(size).offset(page * size).orderBy(mangas.id);
  const [total] = await db.select({ value: count() }).from(mangas);

  const pagination = {
    page,
    size,
    totalElements: total.value,
    totalPages: Math.ceil(total.value / size)
  };

  return {
    mangas: data,
    pagination
  };
};
