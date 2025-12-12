import { describe, it, expect } from "vitest";
import { HttpStatusCode } from "axios";

import AppError from "../../src/utils/error.js";

describe("AppError Utility", () => {
  it("should correctly instantiate with message and statusCode", () => {
    const message = "Resource not found";
    const statusCode = HttpStatusCode.NotFound;

    const error = new AppError(message, statusCode);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.details).toBeUndefined();
  });

  it("should correctly instantiate with details object", () => {
    const message = "Validation failed";
    const statusCode = HttpStatusCode.UnprocessableEntity;
    const details = { email: "Invalid format" };

    const error = new AppError(message, statusCode, details);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.details).toEqual(details);
  });
});
