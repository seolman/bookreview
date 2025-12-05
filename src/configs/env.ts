import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.url().nonempty(),
  JWT_SECRET: z.base64()
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("env parsed failed:", z.flattenError(parsedEnv.error));
  throw new Error("parsed failed");
}

const env = parsedEnv.data;

export default env;
