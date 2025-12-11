import { z } from "zod";

export const registerUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(256),
    email: z.email(),
    password: z.string().min(8).max(256),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});
