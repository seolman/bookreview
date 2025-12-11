import { count, eq, asc, desc, ilike, or } from "drizzle-orm";
import { HttpStatusCode } from "axios";

import db from "../db/index.js";
import { mangas, NewManga } from "../db/schema.js";
import AppError from "../utils/error.js";

export const getMangaById = async (id: number) => {
  const [data] = await db.select().from(mangas).where(eq(mangas.id, id));
  if (!data) {
    throw new AppError("Not Found", HttpStatusCode.NotFound);
  }

  return data;
};

export const getMangas = async (
  page: number,
  size: number,
  sort: string,
  keyword?: string
) => {
  let query = db.select().from(mangas).$dynamic();
  let countQuery = db.select({ value: count() }).from(mangas).$dynamic();

  if (keyword) {
    const searchCondition = or(
      ilike(mangas.title, `%${keyword}%`),
      ilike(mangas.synopsis, `%${keyword}%`)
    );
    query = query.where(searchCondition);
    countQuery = countQuery.where(searchCondition);
  }

  const [total] = await countQuery;

  const totalPages = Math.ceil(total.value / size) || 1;
  if (page > totalPages) {
    throw new AppError("Bad Request", HttpStatusCode.BadRequest);
  }

  const [field, order] = sort.split(",");
  const sortOrder = order?.toLowerCase() === "asc" ? asc : desc;

  const sortableColumns: Record<string, any> = {
    createdAt: mangas.createdAt,
    publishedAt: mangas.publishedAt,
    title: mangas.title,
  };

  const orderByColumn = sortableColumns[field] || mangas.createdAt;

  const data = await query
    .limit(size)
    .offset((page - 1) * size)
    .orderBy(sortOrder(orderByColumn));

  const pagination = {
    page,
    size,
    totalElements: total.value,
    totalPages,
    sort,
    keyword,
  };

  return {
    mangas: data,
    pagination,
  };
};

export const createManga = async (payload: NewManga) => {
  const [existingManga] = await db
    .select()
    .from(mangas)
    .where(eq(mangas.malId, payload.malId));

  if (existingManga) {
    throw new AppError(
      "Manga with this malId already exists",
      HttpStatusCode.Conflict
    );
  }

  const [newManga] = await db.insert(mangas).values(payload).returning();
  return newManga;
};

export const updateMangaById = async (
  mangaId: number,
  updateData: Partial<NewManga>
) => {
  const [data] = await db.select().from(mangas).where(eq(mangas.id, mangaId));
  if (!data) {
    throw new AppError("Manga not found", HttpStatusCode.NotFound);
  }
  const [updatedManga] = await db
    .update(mangas)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(mangas.id, mangaId))
    .returning();

  return updatedManga;
};

export const deleteMangaById = async (mangaId: number) => {
  const [manga] = await db.select().from(mangas).where(eq(mangas.id, mangaId));
  if (!manga) {
    throw new AppError("Manga not found", HttpStatusCode.NotFound);
  }
  await db.delete(mangas).where(eq(mangas.id, mangaId));
};
