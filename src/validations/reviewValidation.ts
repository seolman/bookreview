import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    content: z.string().min(1),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    content: z.string().min(1).optional(),
  }),
});
