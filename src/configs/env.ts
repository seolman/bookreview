import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.url().nonempty(),
  REDIS_URL: z.url().nonempty().default("redis://localhost:6379"),
  JWT_SECRET: z.base64().nonempty(),
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("env parsed failed:", z.flattenError(parsedEnv.error));
  throw new Error("parsed failed");
}

const env = parsedEnv.data;

export default env;
