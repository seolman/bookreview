import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { Server } from "http";
import { Application } from "express";

import { createApp } from "../../src/app.js";
import { pool, db } from "../../src/db/index.js";
import { users, mangas, reviews, comments } from "../../src/db/schema.js";
import { hashPassword } from "../../src/utils/password.js";
import { redis } from "../db/redis.js";

let app: Application;
let server: Server;

let regularUserToken: string;
let adminUserToken: string;
let regularUserId: number;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let adminUserId: number;
let testMangaId: number;

const regularUserCredentials = {
  email: "test-user-e2e@example.com",
  password: "S3curePassword123!",
};

const adminUserCredentials = {
  email: "test-admin-e2e@example.com",
  password: "S3curePassword123!",
};

beforeAll(async () => {
  if (!redis.isReady) {
    await redis.connect();
  }
  app = await createApp();
  server = app.listen();

  await db.delete(comments);
  await db.delete(reviews);
  await db.delete(mangas);
  await db.delete(users);

  const hashedPassword = await hashPassword(regularUserCredentials.password);
  const [seededRegularUser] = await db
    .insert(users)
    .values({
      ...regularUserCredentials,
      username: "regular_e2e",
      hashedPassword,
      role: "user",
    })
    .returning();
  const [seededAdminUser] = await db
    .insert(users)
    .values({
      ...adminUserCredentials,
      username: "admin_e2e",
      hashedPassword,
      role: "admin",
    })
    .returning();

  regularUserId = seededRegularUser.id;
  adminUserId = seededAdminUser.id;

  const [manga] = await db
    .insert(mangas)
    .values({ malId: 9999, title: "E2E Test Manga", publishedAt: new Date() })
    .returning();
  testMangaId = manga.id;

  const loginResUser = await request(app)
    .post("/v1/api/auth/login")
    .send(regularUserCredentials);
  regularUserToken = loginResUser.body.data.accessToken;

  const loginResAdmin = await request(app)
    .post("/v1/api/auth/login")
    .send(adminUserCredentials);
  adminUserToken = loginResAdmin.body.data.accessToken;
});

afterAll(async () => {
  server.close();
  await pool.end();
  if (redis.isReady) {
    await redis.quit();
  }
});

describe("Authentication API (/v1/api/auth)", () => {
  it("FAIL(1): should return 401 for incorrect login credentials", async () => {
    const response = await request(app)
      .post("/v1/api/auth/login")
      .send({ email: regularUserCredentials.email, password: "wrongpassword" });
    expect(response.status).toBe(401);
  });

  it("SUCCESS(2): should return tokens for correct login credentials", async () => {
    const response = await request(app)
      .post("/v1/api/auth/login")
      .send(regularUserCredentials);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("accessToken");
    expect(response.body.data).toHaveProperty("refreshToken");
  });

  it("SUCCESS(3): should return a new access token on refresh", async () => {
    const loginRes = await request(app)
      .post("/v1/api/auth/login")
      .send(regularUserCredentials);
    const refreshToken = loginRes.body.data.refreshToken;
    const response = await request(app)
      .post("/v1/api/auth/refresh")
      .send({ refreshToken });
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("accessToken");
  });

  it("FAIL(4): should return 401 on refresh with invalid token", async () => {
    const response = await request(app)
      .post("/v1/api/auth/refresh")
      .send({ refreshToken: "invalidtoken" });
    expect(response.status).toBe(401);
  });
});

describe("User API (/v1/api/users)", () => {
  it("SUCCESS(5): should get current user profile with /users/me", async () => {
    const response = await request(app)
      .get("/v1/api/users/me")
      .set("Authorization", `Bearer ${regularUserToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(regularUserCredentials.email);
  });

  it("FAIL(6): should not get profile with no token", async () => {
    const response = await request(app).get("/v1/api/users/me");
    expect(response.status).toBe(401);
  });

  it("SUCCESS(7): should update user profile with /users/me", async () => {
    const response = await request(app)
      .put("/v1/api/users/me")
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ username: "new_username" });
    expect(response.status).toBe(200);
    expect(response.body.data.username).toBe("new_username");
  });

  it("FAIL(8): should not get all users as a regular user", async () => {
    const response = await request(app)
      .get("/v1/api/users")
      .set("Authorization", `Bearer ${regularUserToken}`);
    expect(response.status).toBe(403);
  });

  it("SUCCESS(9): should get all users as an admin", async () => {
    const response = await request(app)
      .get("/v1/api/users")
      .set("Authorization", `Bearer ${adminUserToken}`);
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it("SUCCESS(10): admin should be able to change a user's role", async () => {
    const response = await request(app)
      .patch(`/v1/api/users/${regularUserId}/role`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({ role: "admin" });
    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe("admin");

    await request(app)
      .patch(`/v1/api/users/${regularUserId}/role`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({ role: "user" });
  });
});

describe("Manga API (/v1/api/mangas)", () => {
  it("SUCCESS(11): should get a list of mangas", async () => {
    const response = await request(app).get("/v1/api/mangas");
    expect(response.status).toBe(200);
    expect(response.body.pagination).toBeDefined();
  });

  it("SUCCESS(12): should get a single manga by ID", async () => {
    const response = await request(app).get(`/v1/api/mangas/${testMangaId}`);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(testMangaId);
  });

  it("FAIL(13): should return 404 for a non-existent manga", async () => {
    const response = await request(app).get("/v1/api/mangas/999999");
    expect(response.status).toBe(404);
  });
});

describe("Review & Comment Flow", () => {
  let createdReviewId: number;

  it("SUCCESS(14): a user can create a review", async () => {
    const response = await request(app)
      .post(`/v1/api/mangas/${testMangaId}/reviews`)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ rating: 5, content: "This is a test review." });

    expect(response.status).toBe(201);
    expect(response.body.data.rating).toBe(5);
    createdReviewId = response.body.data.id;
  });

  it("FAIL(15): a user cannot review the same manga twice", async () => {
    const response = await request(app)
      .post(`/v1/api/mangas/${testMangaId}/reviews`)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ rating: 4, content: "Trying to review again." });

    expect(response.status).toBe(409);
  });

  it("SUCCESS(16): another user can create a comment on that review", async () => {
    const response = await request(app)
      .post(`/v1/api/reviews/${createdReviewId}/comments`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({ content: "I agree with this review." });

    expect(response.status).toBe(201);
    expect(response.body.data.content).toBe("I agree with this review.");
  });

  it("SUCCESS(17): a user can update their own review", async () => {
    const response = await request(app)
      .put(`/v1/api/reviews/${createdReviewId}`)
      .set("Authorization", `Bearer ${regularUserToken}`)
      .send({ content: "This is an updated review." });

    expect(response.status).toBe(200);
    expect(response.body.data.content).toBe("This is an updated review.");
  });

  it("FAIL(18): a user cannot update another user's review", async () => {
    const response = await request(app)
      .put(`/v1/api/reviews/${createdReviewId}`)
      .set("Authorization", `Bearer ${adminUserToken}`)
      .send({ content: "Trying to edit someone else's review." });

    expect(response.status).toBe(403);
  });

  it("SUCCESS(19): a user can delete their own review", async () => {
    const response = await request(app)
      .delete(`/v1/api/reviews/${createdReviewId}`)
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(response.status).toBe(204);
  });

  it("FAIL(20): should return 404 when trying to get a deleted review", async () => {
    const response = await request(app).get(
      `/v1/api/reviews/${createdReviewId}`
    );
    expect(response.status).toBe(404);
  });
});
