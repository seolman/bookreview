import z from "zod";

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.number(),
    size: z.number(),
    sort: z.number(),
    keyword: z.number(),
  }),
});
