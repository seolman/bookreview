import { describe, it, expect } from "vitest";

import { hashPassword, comparePassword } from "../../src/utils/password.js";

describe("Password Utility", () => {
  const plainPassword = "mySecurePassword123";

  it("should hash a password and not be the same as the original", async () => {
    const hashedPassword = await hashPassword(plainPassword);

    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe("string");
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it("should return true for a correct password", async () => {
    const hashedPassword = await hashPassword(plainPassword);
    const isMatch = await comparePassword(plainPassword, hashedPassword);

    expect(isMatch).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const hashedPassword = await hashPassword(plainPassword);
    const isMatch = await comparePassword("wrongPassword", hashedPassword);

    expect(isMatch).toBe(false);
  });

  it("should produce different hashes for the same password due to salting", async () => {
    const hash1 = await hashPassword(plainPassword);
    const hash2 = await hashPassword(plainPassword);

    expect(hash1).not.toBe(hash2);
  });
});
