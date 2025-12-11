import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import config from "../configs/env.js";

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle({
  client: pool,
  casing: "snake_case",
});
