import { count, eq, asc, desc } from "drizzle-orm";
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

export const getMangas = async (page: number, size: number, sort: string) => {
  const [total] = await db.select({ value: count() }).from(mangas);

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

  const data = await db
    .select()
    .from(mangas)
    .limit(size)
    .offset((page - 1) * size)
    .orderBy(sortOrder(orderByColumn));

  const pagination = {
    page,
    size,
    totalElements: total.value,
    totalPages,
    sort,
  };

  return {
    mangas: data,
    pagination,
  };
};

export const updateMangaById = async (
  mangaId: number,
  updateData: Partial<NewManga>
) => {
  const { title, author, imageUrl, publishedAt, synopsis } = updateData;
  const [updatedManga] = await db
    .update(mangas)
    .set({
      title: title,
      author: author,
      imageUrl: imageUrl,
      publishedAt: publishedAt,
      synopsis: synopsis,
    })
    .where(eq(mangas.id, mangaId))
    .returning();

  return updatedManga;
};
