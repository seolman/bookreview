import { users, mangas, reviews, comments } from "../dist/src/db/schema.js";
import { hashPassword } from "../dist/src/utils/password.js";
import { pool, db } from "../dist/src/db/index.js";

async function seed() {
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

  const hashedPassword = await hashPassword(testUsers[0].password);
  for (const user of testUsers) {
    await db
      .insert(users)
      .values({
        email: user.email,
        username: user.username,
        hashedPassword: hashedPassword,
        role: user.role,
      })
      .onConflictDoUpdate({ target: users.email, set: { hashedPassword } });
  }
  console.log("Users seeded.");

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  for (let i = 1; i <= 8; i++) {
    if (i > 1) {
      await delay(1000);
    }
    const mangaRes = await fetch(`https://api.jikan.moe/v4/manga?page=${i}`);
    if (!mangaRes.ok) {
      console.error(mangaRes.statusText);
      throw new Error("Failed to fetch manga data from Jikan API.");
    }

    const mangaData = await mangaRes.json();
    for (const manga of mangaData.data) {
      if (!manga.published.from) continue;
      await db
        .insert(mangas)
        .values({
          malId: manga.mal_id,
          title: manga.title,
          synopsis: manga.synopsis,
          author: manga.authors[0]?.name || "Unknown",
          publishedAt: new Date(manga.published.from),
          imageUrl: manga.images.jpg.image_url,
        })
        .onConflictDoNothing({ target: mangas.malId });
    }
    console.log("Mangas seeded.");
  }

  const seededUsers = await db.select().from(users);
  const seededMangas = await db.select().from(mangas);

  const user1 = seededUsers.find((u) => u.email === "user@example.com");
  const admin1 = seededUsers.find((u) => u.email === "admin@example.com");

  if (!user1 || !admin1 || seededMangas.length < 2) {
    console.log(
      "Not enough users or mangas to seed reviews/comments. Exiting."
    );
    return;
  }

  console.log("Seeding reviews...");
  const seededReviews = await db
    .insert(reviews)
    .values([
      {
        userId: user1.id,
        mangaId: seededMangas[0].id,
        rating: 5,
        content: "This is a masterpiece, a must-read for everyone!",
      },
      {
        userId: admin1.id,
        mangaId: seededMangas[0].id,
        rating: 4,
        content:
          "Great story and art, but the pacing felt a bit slow in the middle.",
      },
      {
        userId: user1.id,
        mangaId: seededMangas[1].id,
        rating: 3,
        content:
          "It was okay. Not my cup of tea, but I can see why others like it.",
      },
    ])
    .onConflictDoNothing()
    .returning();
  console.log("Reviews seeded.");

  if (seededReviews.length > 0) {
    console.log("Seeding comments...");
    await db.insert(comments).values([
      {
        userId: admin1.id,
        reviewId: seededReviews[0].id,
        content: "I totally agree! The art is breathtaking.",
      },
      {
        userId: user1.id,
        reviewId: seededReviews[0].id,
        content: "Right? I've re-read it three times already.",
      },
    ]);
    console.log("Comments seeded.");
  }

  console.log("seeding end");
}

seed()
  .catch((err) => {
    console.error("failed seeding: ", err);
    process.exit(1);
  })
  .finally(async () => {
    console.log("closing database connection");
    await pool.end();
    console.log("closed");
  });
