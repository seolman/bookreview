import { z } from "zod";

export const createMangaSchema = z.object({
  body: z.object({
    malId: z.number().int().positive(),
    title: z.string().min(1).max(256),
    author: z.string().min(1).max(256).optional(),
    synopsis: z.string().min(1).optional(),
    publishedAt: z.string().datetime(), // ISO 8601 string
    imageUrl: z.string().url(),
  }),
});

export const updateMangaSchema = z.object({
  body: z.object({
    malId: z.number().int().positive().optional(),
    title: z.string().min(1).max(256).optional(),
    author: z.string().min(1).max(256).optional(),
    synopsis: z.string().min(1).optional(),
    publishedAt: z.string().datetime().optional(), // ISO 8601 string
    imageUrl: z.string().url().optional(),
  }),
});
