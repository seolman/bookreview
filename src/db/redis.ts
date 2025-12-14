import { createClient } from "redis";

import env from "../configs/env.js";
import logger from "../utils/logger.js";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("error", (err) => {
  logger.error("Redis client error", err);
});

redis.on("connect", () => {
  logger.info("Redis client connected");
});

(async () => {
  await redis.connect();
})();
