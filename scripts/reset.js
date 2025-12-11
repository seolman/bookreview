import { db, pool } from "../dist/db/index.js";

async function reset() {
  try {
    const tableNames = [
      "users",
      "comments",
      "favorites",
      "refresh_tokens",
      "reviews",
      "mangas",
    ]
      .map((name) => `"${name}"`)
      .join(", ");

    console.log("start truncate");

    await db.execute(`truncate table ${tableNames} restart identity cascade`);

    console.log("end truncate");

    process.exit(0);
  } catch (err) {
    console.error("failed reset", err);
    await pool.end();
    process.exit(1);
  }
}

reset();
