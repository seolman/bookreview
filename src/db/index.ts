import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import config from "../configs/env.js";

const pool = new Pool({
  connectionString: config.DATABASE_URL
});

const db = drizzle({
  client: pool,
  casing: "snake_case"
});

export default db;
