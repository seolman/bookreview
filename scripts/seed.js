import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {} from "axios";

import { users, mangas } from "../dist/db/schema.js";
import { hashPassword } from "../dist/utils/password.js";
import env from "../dist/configs/env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
const db = drizzle(pool);

async function main() {
  console.log("seeding...");
  const testUsers = [
    {
      email: "user@example.com",
      username: "testuser",
      password: "password123",
      role: "user",
    },
    {
      email: "admin@example.com",
      username: "testadmin",
      password: "password123",
      role: "admin",
    },
  ];

  for (const user of testUsers) {
    const hashedPassword = await hashPassword(user.password);
    await db
      .insert(users)
      .values({
        email: user.email,
        username: user.username,
        hashedPassword: hashedPassword,
        role: user.role,
      })
      .onConflictDoNothing({ target: users.email });
  }

  const a = await fetch("https://api.jikan.moe/v4/manga?page=1");
  if (!a.ok) {
    throw new Error();
  }

  const mangaData = await a.json();
  for (const manga of mangaData.data) {
    await db
      .insert(mangas)
      .values({
        malId: manga.mal_id,
        title: manga.title,
        synopsis: manga.synopsis,
        author: manga.authors[0].name,
        publishedAt: manga.published.from
          ? new Date(manga.published.from)
          : new Date(),
        imageUrl: manga.images.jpg.image_url,
      })
      .onConflictDoNothing({ target: mangas.malId });
  }

  console.log("seeding end");
}

main()
  .catch((err) => {
    console.error("failed seeding: ", err);
    process.exit(1);
  })
  .finally(async () => {
    console.log("closing databaes connection");
    await pool.end();
    console.log("closed");
  });
